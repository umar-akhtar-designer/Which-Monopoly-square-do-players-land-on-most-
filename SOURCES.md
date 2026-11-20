# Sources

Every dataset and outside source used in the project. The app shows a short
"Data:" line on the page too, because this file is not uploaded.

## Rules of the game (not data)

- **Hasbro, _Monopoly_ game rules.** The 40 squares, their order, the two card
  piles and the Go To Jail rule. Used for the model's parameters, not copied
  into the app. Monopoly is a trademark of Hasbro; this project is not
  affiliated with Hasbro.
  URL: https://www.hasbro.com/common/instruct/00009.pdf
  License: the rulebook is copyrighted by Hasbro. Only the factual layout and
  the number of cards that move a player are used here; the card wording is
  not reproduced.

## Data

- **None.** No real players, games or turns were used. Every turn in the app is
  simulated from the rules above. This is stated in the app ("simulated data")
  and in the locked test set file (`app/lockedTest.json`).

## Background reading (for comparison, not used in the model)

- J. Sachs, "Monopoly Miscalculations: Mathematical Modeling with Markov
  Chains, Monte Carlo Simulations, and Matrix Methods", Embedded Related, 2026.
  URL: http://www.embeddedrelated.com/showarticle/1819.php
- "Oh, the Places You'll Go in Monopoly", Towards Data Science, 2020.
  URL: https://towardsdatascience.com/oh-the-places-youll-go-in-monopoly-96abf70cdbd7
