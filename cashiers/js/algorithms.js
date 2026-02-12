/**
 * Cashier's Algorithm (Greedy)
 * Iteratively selects the largest coin denomination less than or equal to the remaining amount.
 * @param {number} amount
 * @param {Array<number>} denominations
 * @returns {object} - { coins: Array<number>, steps: Array<{line: number, text: string, action?: {type: string, coin?: number}}>}
 */
function cashiersGreedy(amount, denominations) {
    const steps = [];
    let remaining = amount;
    const result = [];
    const sortedDenominations = [...new Set(denominations.filter((coin) => Number.isFinite(coin) && coin > 0))]
        .sort((a, b) => b - a);

    steps.push({ line: 0, text: `Input: amount = ${amount}, coin_values = [${denominations.join(', ')}].` });
    steps.push({ line: 1, text: `sorted_coin_values (descending) = [${sortedDenominations.join(', ')}].` });
    steps.push({ line: 2, text: "Initialize selected_coins = [] and remaining_amount = amount.", action: { type: "clear" } });

    while (remaining > 0) {
        steps.push({ line: 3, text: `remaining_amount = ${remaining} > 0, continue loop.` });

        const selectedCoin = sortedDenominations.find((coin) => coin <= remaining);
        steps.push({
            line: 4,
            text: selectedCoin
                ? `largest_possible_coin = ${selectedCoin} (largest coin_value <= remaining_amount).`
                : `No coin_value satisfies coin_value <= remaining_amount (${remaining}).`
        });

        if (selectedCoin === undefined) {
            steps.push({ line: 5, text: "No feasible largest_possible_coin found." });
            steps.push({ line: 6, text: "Return: no solution." });
            return { coins: [], steps, success: false };
        }

        remaining -= selectedCoin;
        steps.push({ line: 7, text: `Update remaining_amount <- remaining_amount - largest_possible_coin = ${remaining}.` });

        result.push(selectedCoin);
        steps.push({ line: 8, text: `Append ${selectedCoin} to selected_coins.`, action: { type: "add", coin: selectedCoin } });
    }

    steps.push({ line: 9, text: `Return selected_coins = [${result.join(', ')}].` });
    return { coins: result, steps, success: true };
}

/**
 * Dynamic Programming Approach
 * @param {number} amount
 * @param {Array<number>} denominations
 * @returns {object}
 */
function minCoinsDP(amount, denominations) {
    const steps = [];
    const pushStep = (line, text, options = {}) => {
        steps.push({
            line,
            text,
            ...options
        });
    };
    const filteredDenominations = [...new Set(denominations.filter((coin) => Number.isFinite(coin) && coin > 0))]
        .sort((a, b) => a - b);
    const dp = new Array(amount + 1).fill(Infinity);
    const firstCoin = new Array(amount + 1).fill(null);
    dp[0] = 0;
    firstCoin[0] = 0;

    pushStep(0, `Input: amount = ${amount}, coin_values = [${denominations.join(', ')}].`, {
        viz: { type: 'setup', amount, denominations: filteredDenominations }
    });
    pushStep(1, "Initialize min_piece_count_for_amount[0] = 0 and first_coin_for_amount[0] = 0.", {
        viz: { type: 'initBase' }
    });

    for (let i = 1; i <= amount; i++) {
        dp[i] = Infinity;
        firstCoin[i] = null;
    }

    pushStep(2, `Initialize min_piece_count_for_amount[amount_index] = Infinity and first_coin_for_amount[amount_index] = null for amount_index = 1..${amount}.`, {
        viz: { type: 'initArrays', amount }
    });

    const detailPrefixLimit = Math.min(amount, 4);
    const showMilestone = (i) => i <= 12 || i === amount || i % 25 === 0;

    if (amount > detailPrefixLimit) {
        pushStep(3, `Table fill runs for amount_index = 1..${amount}. First ${detailPrefixLimit} values are expanded; later values are summarized.`);
        pushStep(4, "For each amount_index, evaluate all feasible candidate_coin values with candidate_coin <= amount_index.");
        pushStep(5, "Transition rule tested: min_piece_count_for_amount[amount_index-candidate_coin] + 1 < min_piece_count_for_amount[amount_index].");
    }

    for (let i = 1; i <= amount; i++) {
        if (i <= detailPrefixLimit) {
            pushStep(3, `Solve subproblem amount_index = ${i}.`, {
                viz: { type: 'setCurrentI', i }
            });
        }

        for (const coin of filteredDenominations) {
            if (coin > i) {
                if (i <= detailPrefixLimit) {
                    pushStep(4, `candidate_coin = ${coin} is greater than amount_index = ${i}; skip.`);
                }
                continue;
            }

            const candidate = dp[i - coin] + 1;

            if (i <= detailPrefixLimit) {
                const currentBest = Number.isFinite(dp[i]) ? dp[i] : 'Infinity';
                pushStep(5, `Test candidate_coin = ${coin}: min_piece_count_for_amount[${i - coin}] + 1 = ${candidate} < min_piece_count_for_amount[${i}] (${currentBest})?`, {
                    viz: {
                        type: 'testCandidate',
                        i,
                        coin,
                        candidate,
                        current: Number.isFinite(dp[i]) ? dp[i] : null
                    }
                });
            }

            if (candidate < dp[i]) {
                dp[i] = candidate;
                firstCoin[i] = coin;

                if (i <= detailPrefixLimit) {
                    pushStep(6, `Update: min_piece_count_for_amount[${i}] = ${candidate}, first_coin_for_amount[${i}] = ${coin}.`, {
                        viz: {
                            type: 'updateCell',
                            i,
                            value: candidate,
                            coin
                        }
                    });
                }
            }
        }

        if (i > detailPrefixLimit && showMilestone(i)) {
            if (firstCoin[i] === null) {
                pushStep(6, `Summary amount_index = ${i}: still unreachable (min_piece_count_for_amount[${i}] = Infinity).`, {
                    viz: {
                        type: 'summaryCell',
                        i,
                        value: null,
                        coin: null
                    }
                });
            } else {
                pushStep(6, `Summary amount_index = ${i}: best is min_piece_count_for_amount[${i}] = ${dp[i]} using first_coin_for_amount[${i}] = ${firstCoin[i]}.`, {
                    viz: {
                        type: 'summaryCell',
                        i,
                        value: dp[i],
                        coin: firstCoin[i]
                    }
                });
            }
        } else if (i > detailPrefixLimit) {
            pushStep(6, '', {
                quick: true,
                viz: {
                    type: 'summaryCell',
                    i,
                    value: firstCoin[i] === null ? null : dp[i],
                    coin: firstCoin[i]
                }
            });
        }
    }

    if (dp[amount] === Infinity) {
        pushStep(7, `min_piece_count_for_amount[${amount}] is Infinity. Return: no solution.`, {
            viz: { type: 'noSolution' }
        });
        return { coins: [], steps, success: false };
    }

    pushStep(8, `Start reconstruction with reconstruction_remaining_amount = ${amount} and optimal_piece_count = ${dp[amount]}.`, {
        action: { type: "clear" },
        viz: { type: 'reconstructStart', cursor: amount }
    });

    const result = [];
    let cursor = amount;

    while (cursor > 0) {
        const coin = firstCoin[cursor];

        if (coin === null) {
            pushStep(7, `Reconstruction failed at reconstruction_remaining_amount = ${cursor}. Return: no solution.`, {
                viz: { type: 'noSolution' }
            });
            return { coins: [], steps, success: false };
        }

        result.push(coin);
        const nextCursor = cursor - coin;
        pushStep(9, `Append ${coin} to selected_coins, then set reconstruction_remaining_amount <- ${cursor} - ${coin} = ${nextCursor}.`, {
            action: { type: "add", coin },
            viz: {
                type: 'reconstructPick',
                i: cursor,
                coin,
                next: nextCursor
            }
        });
        cursor = nextCursor;
    }

    pushStep(10, `Return optimal selected_coins = [${result.join(', ')}].`, {
        viz: { type: 'done', count: result.length }
    });
    return { coins: result, steps, success: true };
}

function minCoinCountDP(amount, denominations) {
    const filteredDenominations = [...new Set(
        denominations.filter((coin) => Number.isFinite(coin) && coin > 0)
    )].sort((a, b) => a - b);

    const minPieceCountForAmount = new Array(amount + 1).fill(Infinity);
    minPieceCountForAmount[0] = 0;

    for (let amountIndex = 1; amountIndex <= amount; amountIndex += 1) {
        for (const candidateCoin of filteredDenominations) {
            if (candidateCoin > amountIndex) {
                continue;
            }

            const candidatePieceCount = minPieceCountForAmount[amountIndex - candidateCoin] + 1;
            if (candidatePieceCount < minPieceCountForAmount[amountIndex]) {
                minPieceCountForAmount[amountIndex] = candidatePieceCount;
            }
        }
    }

    return minPieceCountForAmount[amount];
}

const ALGO_CODES = {
    greedy: [
        "FUNCTION GREEDY_CHANGE(amount, coin_values)", // 0
        "  sorted_coin_values <- SORT_DESC(UNIQUE_POSITIVE(coin_values))", // 1
        "  selected_coins <- empty list; remaining_amount <- amount", // 2
        "  WHILE remaining_amount > 0 DO", // 3
        "    largest_possible_coin <- FIRST coin_value IN sorted_coin_values WITH coin_value <= remaining_amount", // 4
        "    IF largest_possible_coin is undefined THEN", // 5
        "      RETURN no solution", // 6
        "    remaining_amount <- remaining_amount - largest_possible_coin", // 7
        "    APPEND largest_possible_coin TO selected_coins", // 8
        "  RETURN selected_coins" // 9
    ],
    dp: [
        "FUNCTION MIN_COINS_DP(amount, coin_values)", // 0
        "  min_piece_count_for_amount[0] <- 0; first_coin_for_amount[0] <- 0", // 1
        "  FOR amount_index <- 1 TO amount: min_piece_count_for_amount[amount_index] <- INF; first_coin_for_amount[amount_index] <- null", // 2
        "  FOR amount_index <- 1 TO amount DO", // 3
        "    FOR EACH candidate_coin IN SORT_ASC(UNIQUE_POSITIVE(coin_values)) WITH candidate_coin <= amount_index DO", // 4
        "      IF min_piece_count_for_amount[amount_index - candidate_coin] + 1 < min_piece_count_for_amount[amount_index] THEN", // 5
        "        min_piece_count_for_amount[amount_index] <- min_piece_count_for_amount[amount_index - candidate_coin] + 1; first_coin_for_amount[amount_index] <- candidate_coin", // 6
        "  IF min_piece_count_for_amount[amount] = INF THEN RETURN no solution", // 7
        "  selected_coins <- empty list; reconstruction_remaining_amount <- amount", // 8
        "  WHILE reconstruction_remaining_amount > 0: APPEND first_coin_for_amount[reconstruction_remaining_amount] TO selected_coins; reconstruction_remaining_amount <- reconstruction_remaining_amount - first_coin_for_amount[reconstruction_remaining_amount]", // 9
        "  RETURN selected_coins" // 10
    ]
};
