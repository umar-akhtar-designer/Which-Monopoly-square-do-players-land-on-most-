// Monopoly landing squares.
//
// One player rolls two fair dice each turn and walks that many squares. Go To
// Jail and the two card piles can move the player somewhere else, and a player
// sent to Jail sits out one turn. The numbers come from Hasbro's rules, not
// from data, and the turns are simulated in the browser.
import {useEffect, useMemo, useRef, useState} from 'react';
import type {CSSProperties} from 'react';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import boardJson from './board.json';
import chanceJson from './chance.json';
import chestJson from './chest.json';
import lockedJson from './lockedTest.json';

type Square = {name: string; type: string};
type Card = {text: string; move: string | null; square?: number};

const BOARD = boardJson as Square[];
const CHANCE = chanceJson as Card[];
const CHEST = chestJson as Card[];
const LOCKED = lockedJson as {seed: number; turns: number};

// Ways to roll each total with two fair dice, out of 36.
const WAYS = [0, 0, 1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1];
const JAIL = 10;
const GO_TO_JAIL = 30;

const pct = (x: number) => `${(x * 100).toFixed(2)}%`;

/** A small seeded random number generator, so a run can be repeated. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The next square of a type, moving forward and wrapping at Go. */
function nextOfType(from: number, type: string): number {
  for (let step = 1; step <= 40; step++) {
    const i = (from + step) % 40;
    if (BOARD[i].type === type) return i;
  }
  return from;
}

// ---------------------------------------------------------------------------
// The exact answer: every turn's chances as a table from square to square.
// ---------------------------------------------------------------------------

/**
 * Adds the chances of ending up somewhere after landing on `pos`, following
 * that square's rule (Go To Jail, a card, or nothing).
 */
function settleWeighted(pos: number, weight: number, out: number[], depth: number) {
  if (depth > 3) {
    out[pos] += weight;
    return;
  }
  if (pos === GO_TO_JAIL) {
    out[40 + JAIL] += weight; // sent to Jail, and sits out the next turn
    return;
  }
  const type = BOARD[pos].type;
  if (type === 'chance') {
    for (const card of CHANCE) applyCardWeighted(card, pos, weight / CHANCE.length, out, depth);
    return;
  }
  if (type === 'chest') {
    for (const card of CHEST) applyCardWeighted(card, pos, weight / CHEST.length, out, depth);
    return;
  }
  out[pos] += weight;
}

/** Adds the chances of one card's move. A card with no move leaves you there. */
function applyCardWeighted(card: Card, from: number, weight: number, out: number[], depth: number) {
  if (card.move === 'go') settleWeighted(0, weight, out, depth + 1);
  else if (card.move === 'jail') out[40 + JAIL] += weight;
  else if (card.move === 'square' && typeof card.square === 'number')
    settleWeighted(card.square, weight, out, depth + 1);
  else if (card.move === 'back3') settleWeighted((from + 37) % 40, weight, out, depth + 1);
  else if (card.move === 'nearestRail') settleWeighted(nextOfType(from, 'railroad'), weight, out, depth + 1);
  else if (card.move === 'nearestUtil') settleWeighted(nextOfType(from, 'utility'), weight, out, depth + 1);
  else out[from] += weight;
}

/**
 * Multiplies the one-turn table by itself many times to get the long-run
 * chance of a turn ending on each square. 80 states: square 0-39 free, and
 * square 40-79 for a player who must sit out this turn in Jail.
 */
function exactModel(): number[] {
  const table: {to: number; p: number}[][] = [];

  for (let state = 0; state < 80; state++) {
    if (state >= 40) {
      table.push([{to: JAIL, p: 1}]); // the Jail turn is spent, then free at Jail
      continue;
    }
    const out = new Array(80).fill(0);
    for (let total = 2; total <= 12; total++) {
      settleWeighted((state + total) % 40, WAYS[total] / 36, out, 0);
    }
    const moves: {to: number; p: number}[] = [];
    for (let to = 0; to < 80; to++) if (out[to] > 1e-12) moves.push({to, p: out[to]});
    table.push(moves);
  }

  let v = new Array(80).fill(0);
  v[0] = 1; // start on Go
  for (let round = 0; round < 3000; round++) {
    const next = new Array(80).fill(0);
    for (let state = 0; state < 80; state++) {
      const w = v[state];
      if (w === 0) continue;
      for (const move of table[state]) next[move.to] += w * move.p;
    }
    v = next;
  }

  return Array.from({length: 40}, (_, i) => v[i] + v[40 + i]);
}

// ---------------------------------------------------------------------------
// The simulation: the same story, played turn by turn.
// ---------------------------------------------------------------------------

function settlePlayed(pos: number, rng: () => number): {pos: number; jail: boolean} {
  for (let guard = 0; guard < 5; guard++) {
    if (pos === GO_TO_JAIL) return {pos: JAIL, jail: true};
    const type = BOARD[pos].type;
    if (type !== 'chance' && type !== 'chest') return {pos, jail: false};

    const deck = type === 'chance' ? CHANCE : CHEST;
    const card = deck[Math.min(deck.length - 1, Math.floor(rng() * deck.length))];

    if (card.move === 'go') {
      pos = 0;
      continue;
    }
    if (card.move === 'jail') return {pos: JAIL, jail: true};
    if (card.move === 'square' && typeof card.square === 'number') {
      pos = card.square;
      continue;
    }
    if (card.move === 'back3') {
      pos = (pos + 37) % 40;
      continue;
    }
    if (card.move === 'nearestRail') {
      pos = nextOfType(pos, 'railroad');
      continue;
    }
    if (card.move === 'nearestUtil') {
      pos = nextOfType(pos, 'utility');
      continue;
    }
    return {pos, jail: false};
  }
  return {pos, jail: false};
}

/** Plays `turns` turns and counts how many end on each square. */
function simulate(turns: number, seed: number): number[] {
  const rng = mulberry32(seed);
  const counts = new Array(40).fill(0);
  let pos = 0;
  let inJail = false;

  for (let turn = 0; turn < turns; turn++) {
    if (inJail) {
      counts[JAIL]++;
      inJail = false;
      continue;
    }
    const total = 2 + Math.floor(rng() * 6) + Math.floor(rng() * 6);
    const landed = settlePlayed((pos + total) % 40, rng);
    pos = landed.pos;
    inJail = landed.jail;
    counts[pos]++;
  }
  return counts;
}

// ---------------------------------------------------------------------------
// Scores and gaps
// ---------------------------------------------------------------------------

/** Average log10 likelihood of one turn, under a set of chances. Higher is better. */
function logScore(counts: number[], chances: number[]): number {
  let total = 0;
  let n = 0;
  for (let i = 0; i < 40; i++) {
    if (counts[i] === 0) continue; // Go To Jail is never a resting square, so its chance is 0
    total += counts[i] * Math.log10(chances[i]);
    n += counts[i];
  }
  return n === 0 ? 0 : total / n;
}

/** Mean distance between the chances and what happened, in percentage points. */
function averageGap(counts: number[], chances: number[], turns: number): number {
  let sum = 0;
  for (let i = 0; i < 40; i++) sum += Math.abs(chances[i] - counts[i] / turns);
  return (sum / 40) * 100;
}

function maxGap(counts: number[], chances: number[], turns: number): number {
  let worst = 0;
  for (let i = 0; i < 40; i++) worst = Math.max(worst, Math.abs(chances[i] - counts[i] / turns));
  return worst * 100;
}

// ---------------------------------------------------------------------------

const ink = '#1c1c1c';
const green = '#14532d';
const red = '#9f1d1d';
const paper = '#f4efe3';
const card = '#fffdf7';
const muted = '#5b5b52';

export default function App() {
  const model = useMemo(exactModel, []);
  const [turns, setTurns] = useState(20000);
  const [seed, setSeed] = useState(7);
  const [test, setTest] = useState<number[] | null>(null);

  // Measure the chart's box, so the chart is exactly as wide as the card.
  const chartBox = useRef<HTMLDivElement>(null);
  const [chartWidth, setChartWidth] = useState(320);
  useEffect(() => {
    const box = chartBox.current;
    if (!box) return;
    const measure = () => setChartWidth(Math.max(280, Math.floor(box.getBoundingClientRect().width)));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  const counts = useMemo(() => simulate(turns, seed), [turns, seed]);

  const ranking = useMemo(
    () => BOARD.map((square, i) => ({...square, i, p: model[i]})).sort((a, b) => b.p - a.p),
    [model],
  );
  const jailRank = ranking.findIndex(s => s.i === JAIL) + 1;
  const topProperty =
    ranking.find(s => s.type === 'property' || s.type === 'railroad' || s.type === 'utility') ?? ranking[0];

  const chart = BOARD.map((square, i) => ({
    n: i,
    name: square.name,
    model: model[i] * 100,
    sim: (counts[i] / turns) * 100,
  }));

  const topFive = ranking.slice(0, 5);
  const uniformScore = Math.log10(1 / 40);
  const testScore = test ? logScore(test, model) : 0;
  const testGap = test ? averageGap(test, model, LOCKED.turns) : 0;
  const testWorst = test ? maxGap(test, model, LOCKED.turns) : 0;

  const box: CSSProperties = {
    background: card,
    border: '1px solid #dcd5c5',
    borderRadius: 2,
    padding: '22px 24px',
    marginTop: 18,
  };
  const plain: CSSProperties = {
    marginTop: 30,
    paddingTop: 22,
    borderTop: '1px solid #cfc7b6',
  };
  const h2: CSSProperties = {
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontSize: 26,
    lineHeight: 1.25,
    marginTop: 0,
    marginBottom: 10,
    color: ink,
  };
  const h3: CSSProperties = {
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontSize: 19,
    marginTop: 22,
    marginBottom: 6,
  };
  const mono: CSSProperties = {fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace'};
  const small: CSSProperties = {fontSize: 16, color: muted};

  return (
    <main
      style={{
        fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif',
        fontSize: 17,
        lineHeight: 1.6,
        color: ink,
        background: paper,
        minHeight: '100vh',
        paddingBottom: 64,
      }}
    >
      <div style={{background: green, color: '#f6f1e4', padding: '10px 16px'}}>
        <div
          style={{
            maxWidth: 860,
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
            fontSize: 16,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
          }}
        >
          <span>Probability for AI · final project</span>
          <span>Fall 2026</span>
        </div>
      </div>

      <div style={{maxWidth: 860, margin: '0 auto', padding: '0 16px'}}>
        <header style={{paddingTop: 34, paddingBottom: 6}}>
          <h1
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: 38,
              lineHeight: 1.18,
              margin: '0 0 14px',
              color: ink,
            }}
          >
            Which Monopoly square
            <br />
            do players land on most?
          </h1>
          <p style={{marginTop: 0}}>
            Most Monopoly players have a theory about one square. I wanted a real answer to a small part of that
            argument: over a long game, how often does a turn end on each of the 40 squares? I wrote down a guess
            first, worked out the exact answer from the rules, then kept some turns hidden to test it at the end.
          </p>
        </header>

        <section style={plain} aria-labelledby="guess">
          <h2 id="guess" style={h2}>
            My guess, written down before I looked
          </h2>
          <div
            style={{
              background: '#fff3c4',
              border: '1px solid #dcc76a',
              padding: '14px 16px',
              maxWidth: 470,
              transform: 'rotate(-0.5deg)',
              margin: '6px 0 16px',
            }}
          >
            <p style={{margin: 0, fontSize: 18}}>
              “I think <strong>Jail / Just Visiting</strong> is landed on most. I am <strong>50%</strong> sure.”
            </p>
            <p style={{...small, margin: '8px 0 0'}}>Written down before any simulation was run.</p>
          </div>
          <p>
            I could not really choose between Jail and Illinois Avenue, so 50% is honest. The answer turned out to
            be <strong>{ranking[0].name}</strong> at <strong style={mono}>{pct(ranking[0].p)}</strong>. It is{' '}
            <strong>number {jailRank === 1 ? 'one' : jailRank}</strong>, so {jailRank === 1 ? 'the guess was right' : 'the guess was wrong'}.
            The catch is that Jail is not a property. If you only care about squares you can buy, the winner is{' '}
            <strong>{topProperty.name}</strong> at <strong style={mono}>{pct(topProperty.p)}</strong>.
          </p>
        </section>

        <section style={plain} aria-labelledby="model">
          <h2 id="model" style={h2}>
            How the model works
          </h2>
          <p>
            One player walks around the board forever. Each turn they roll two dice and move that many squares,
            wrapping past Go. Three squares break the pattern:
          </p>
          <ul style={{marginTop: 0, paddingLeft: 22}}>
            <li>Go To Jail sends them to Jail.</li>
            <li>Chance and Community Chest make them draw a card.</li>
            <li>
              Some cards move them again: to a named square, back three spaces, to the nearest railroad or utility,
              or to Jail.
            </li>
          </ul>
          <p>
            A player sent to Jail sits out one turn, then carries on. That is the whole game here. There is no
            money, no buying, no houses, no trading, and only one player.
          </p>

          <h3 style={h3}>Where the numbers come from</h3>
          <p style={{marginTop: 0}}>
            The parameters come from the rules, not from data:
          </p>
          <ul style={{marginTop: 0, paddingLeft: 22}}>
            <li>Two fair dice. A total of 7 has chance 6/36; 2 and 12 have 1/36 each.</li>
            <li>
              Each pile has 16 cards, and I treat each draw as independent, so every card has chance 1/16. A real
              deck is shuffled and cards leave it. I did not model that.
            </li>
            <li>Jail costs exactly one turn.</li>
          </ul>
          <p style={{marginBottom: 0}}>
            I did not fit these to data. Pretending a simulation taught me the dice would be silly.
          </p>
        </section>

        <section style={box} aria-labelledby="try">
          <h2 id="try" style={h2}>
            Try it
          </h2>
          <p style={{marginTop: 0}}>
            The bars are the exact long-run answer: take the chances for one turn and multiply them by themselves
            many times. The red line is one simulation of the same rules. The two should sit on top of each other.
            If they do not, my code is wrong.
          </p>

          <label htmlFor="turns" style={{display: 'block', marginTop: 10}}>
            Turns to simulate: <strong style={mono}>{turns.toLocaleString('en-US')}</strong>
          </label>
          <input
            id="turns"
            type="range"
            min={2000}
            max={100000}
            step={2000}
            value={turns}
            onChange={e => setTurns(Number(e.target.value))}
            style={{width: '100%', maxWidth: 520, accentColor: green}}
          />
          <div>
            <button
              type="button"
              onClick={() => setSeed(s => s + 1)}
              style={{
                marginTop: 8,
                fontSize: 17,
                padding: '8px 14px',
                border: `1px solid ${green}`,
                background: card,
                color: green,
                borderRadius: 2,
                cursor: 'pointer',
              }}
            >
              Roll new dice
            </button>
          </div>

          <div
            ref={chartBox}
            role="img"
            aria-label="Chart of the chance that a turn ends on each of the 40 squares. Bars are the exact answer and the red line is the simulation. The top five are listed in the table below."
            style={{width: '100%', height: 380, marginTop: 14}}
          >
            <ComposedChart width={chartWidth} height={380} data={chart} margin={{top: 8, right: 16, bottom: 8, left: 8}}>
              <CartesianGrid strokeDasharray="2 4" stroke="#d8d2c4" />
              <XAxis dataKey="n" interval={4} tick={{fontSize: 16}} />
              <YAxis
                tick={{fontSize: 16}}
                unit="%"
                width={58}
                domain={[0, 10]}
                ticks={[0, 2, 4, 6, 8, 10]}
              />
              <Tooltip
                formatter={(value: number | string, name: string) => [
                  `${Number(value).toFixed(2)}%`,
                  name === 'model' ? 'exact answer' : 'simulation',
                ]}
                labelFormatter={n => `${n}. ${BOARD[Number(n)]?.name ?? ''}`}
              />
              <Legend verticalAlign="top" height={30} wrapperStyle={{fontSize: 16}} />
              <Bar dataKey="model" name="exact answer" fill={green} maxBarSize={22} isAnimationActive={false} />
              <Line
                dataKey="sim"
                name="simulation"
                stroke={red}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </ComposedChart>
          </div>
          <p style={{...small, marginTop: 6}}>
            Square number runs along the bottom, 0 = Go. Bars are the exact answer; the red line is the simulation.
          </p>

          <h3 style={h3}>The top five</h3>
          <div style={{overflowX: 'auto'}}>
          <table style={{borderCollapse: 'collapse', width: '100%', fontSize: 17}}>
            <thead>
              <tr style={{textAlign: 'left', borderBottom: `2px solid ${ink}`}}>
                <th scope="col" style={{padding: '6px 8px'}}>#</th>
                <th scope="col" style={{padding: '6px 8px'}}>Square</th>
                <th scope="col" style={{padding: '6px 8px'}}>Can you buy it?</th>
                <th scope="col" style={{padding: '6px 8px'}}>Exact answer</th>
                <th scope="col" style={{padding: '6px 8px'}}>This run</th>
                {test ? <th scope="col" style={{padding: '6px 8px'}}>Hidden turns</th> : null}
              </tr>
            </thead>
            <tbody>
              {topFive.map((square, i) => (
                <tr key={square.name} style={{borderBottom: '1px solid #e3ddd0'}}>
                  <td style={{padding: '6px 8px'}}>{i + 1}</td>
                  <td style={{padding: '6px 8px'}}>{square.name}</td>
                  <td style={{padding: '6px 8px'}}>
                    {square.type === 'property' || square.type === 'railroad' || square.type === 'utility'
                      ? 'yes'
                      : 'no'}
                  </td>
                  <td style={{padding: '6px 8px', ...mono}}>{pct(square.p)}</td>
                  <td style={{padding: '6px 8px', ...mono}}>{pct(counts[square.i] / turns)}</td>
                  {test ? (
                    <td style={{padding: '6px 8px', ...mono}}>{pct(test[square.i] / LOCKED.turns)}</td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          <p style={{...small, marginBottom: 0}}>
            There is no bar at square 30, Go To Jail, because nobody stays there. The turn ends in Jail instead.
          </p>
        </section>

        <section style={box} aria-labelledby="test">
          <h2 id="test" style={h2}>
            The turns I saved for the end
          </h2>
          <p style={{marginTop: 0}}>
            Before looking at any result I fixed a seed for {LOCKED.turns.toLocaleString('en-US')} turns and put it
            in the code. The page only plays those turns when you press this button, once. They are the closest
            thing I have to new data.
          </p>
          <button
            type="button"
            onClick={() => setTest(simulate(LOCKED.turns, LOCKED.seed))}
            disabled={test !== null}
            style={{
              fontSize: 17,
              padding: '10px 16px',
              border: 'none',
              borderRadius: 2,
              background: test ? '#8a8a80' : green,
              color: '#fff',
              cursor: test ? 'default' : 'pointer',
            }}
          >
            {test ? 'Test set opened' : 'Open the hidden turns (once)'}
          </button>

          {test ? (
            <div style={{marginTop: 16}}>
              <p style={{marginTop: 0}}>
                The average gap between the exact answer and these turns is{' '}
                <strong style={mono}>{testGap.toFixed(2)}</strong> percentage points. The worst square is off by{' '}
                <strong style={mono}>{testWorst.toFixed(2)}</strong> points. The model scores{' '}
                <strong style={mono}>{testScore.toFixed(3)}</strong> per turn; a uniform guess scores{' '}
                <strong style={mono}>{uniformScore.toFixed(3)}</strong>. Higher is better, and the model is higher.
              </p>
              <p style={{marginBottom: 0, ...small}}>
                The top square on the hidden turns was{' '}
                <strong>{BOARD[test.indexOf(Math.max(...test))].name}</strong>. I opened it once, after the model was
                finished, and did not change anything afterwards.
              </p>
            </div>
          ) : null}
        </section>

        <section style={plain} aria-labelledby="sure">
          <h2 id="sure" style={h2}>
            How sure am I?
          </h2>
          <p style={{marginTop: 0}}>
            I trust the order at the top more than the exact percentages. The exact answer and the hidden turns
            agree closely, and there is nothing in the model to tune, so I do not think I fooled myself.
          </p>
          <p>
            Two simplifications bother me. I left out the extra turn after doubles, so some turns skip a square they
            would have landed on. I also let cards repeat instead of leaving the deck. Real games have four players,
            buying and trades on top of that.
          </p>
          <p style={{marginBottom: 0}}>
            If I kept working, I would add the doubles rule first, then more players. If either changed the winner,
            I would say so.
          </p>
        </section>

        <footer style={{...plain, ...small}}>
          <p style={{marginTop: 0}}>
            <strong>Data:</strong> none. The board and the two card piles come from Hasbro's Monopoly rules, and
            every turn on this page is simulated. Monopoly is a Hasbro trademark; this is a class project and is not
            affiliated with Hasbro.
          </p>
          <p style={{marginBottom: 0}}>Probability for AI, Fall 2026.</p>
        </footer>
      </div>
    </main>
  );
}
