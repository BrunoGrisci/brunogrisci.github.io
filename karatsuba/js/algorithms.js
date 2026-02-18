(function () {
  function stripNonDigits(value) {
    return String(value || '').replace(/\D+/g, '');
  }

  function trimLeadingZeros(value) {
    const cleaned = String(value || '').replace(/^0+(?=\d)/, '');
    return cleaned.length ? cleaned : '0';
  }

  function nextPowerOfTwo(n) {
    let p = 1;
    while (p < n) p *= 2;
    return p;
  }

  function prepareNumbers(xRaw, yRaw) {
    const sx = stripNonDigits(xRaw);
    const sy = stripNonDigits(yRaw);
    if (!sx || !sy) {
      return null;
    }
    const xClean = trimLeadingZeros(sx);
    const yClean = trimLeadingZeros(sy);
    const n = nextPowerOfTwo(Math.max(xClean.length, yClean.length));
    const x = xClean.padStart(n, '0');
    const y = yClean.padStart(n, '0');
    return {
      x,
      y,
      n,
      changed: x !== xClean || y !== yClean
    };
  }

  function addStringsCount(a, b) {
    let i = a.length - 1;
    let j = b.length - 1;
    let carry = 0;
    let out = '';
    let addOps = 0;

    while (i >= 0 || j >= 0) {
      const da = i >= 0 ? Number(a[i]) : 0;
      const db = j >= 0 ? Number(b[j]) : 0;
      const s = da + db + carry;
      addOps += 1;
      out = String(s % 10) + out;
      carry = Math.floor(s / 10);
      i -= 1;
      j -= 1;
    }

    if (carry > 0) {
      out = String(carry) + out;
    }

    return { sum: trimLeadingZeros(out), addOps };
  }

  function multiplyByDigitCount(x, digit) {
    let carry = 0;
    let out = '';
    let mulOps = 0;
    let addOps = 0;

    for (let i = x.length - 1; i >= 0; i -= 1) {
      const d = Number(x[i]);
      const p = d * digit;
      mulOps += 1;
      const s = p + carry;
      addOps += 1;
      out = String(s % 10) + out;
      carry = Math.floor(s / 10);
    }

    while (carry > 0) {
      out = String(carry % 10) + out;
      carry = Math.floor(carry / 10);
    }

    return {
      value: trimLeadingZeros(out),
      mulOps,
      addOps
    };
  }

  function sumManyStringsCount(values) {
    let running = '0';
    let addOps = 0;
    for (const value of values) {
      const res = addStringsCount(running, value);
      running = res.sum;
      addOps += res.addOps;
    }
    return { sum: running, addOps };
  }

  function splitPowerExpr(value) {
    const terms = [];
    for (let i = 0; i < value.length; i += 1) {
      const digit = value[i];
      const exp = value.length - 1 - i;
      terms.push(`${digit}·10^${exp}`);
    }
    return terms.join(' + ');
  }

  function buildClassroomExecution(input) {
    const { x, y, n } = input;
    const partials = [];
    const steps = [];
    const rowDisplays = [];
    const carryDisplays = [];

    let cumulativeMul = 0;
    let cumulativeAdd = 0;

    function pushStep(step) {
      steps.push({
        ...step,
        counts: {
          mul: cumulativeMul,
          add: cumulativeAdd
        },
        rowDisplays: step.rowDisplays ? [...step.rowDisplays] : [],
        carryDisplays: step.carryDisplays ? [...step.carryDisplays] : []
      });
    }

    pushStep({
      line: 1,
      messageKey: 'step_class_prepare',
      rowDisplays: [],
      carryDisplays: [],
      highlightPartial: -1,
      showTotal: false
    });

    if (trimLeadingZeros(x) === '0' || trimLeadingZeros(y) === '0') {
      cumulativeMul += 1;
      pushStep({
        line: 2,
        messageKey: 'step_class_zero',
        rowDisplays,
        carryDisplays,
        highlightPartial: -1,
        showTotal: true
      });

      pushStep({
        line: 8,
        messageKey: 'step_class_done',
        rowDisplays,
        carryDisplays,
        highlightPartial: -1,
        showTotal: true
      });

      return {
        algorithm: 'classroom',
        x,
        y,
        n,
        result: '0',
        partials,
        steps,
        powers: {
          x: splitPowerExpr(x),
          y: splitPowerExpr(y)
        }
      };
    }

    for (let j = y.length - 1; j >= 0; j -= 1) {
      const digit = Number(y[j]);
      const shift = y.length - 1 - j;
      const shiftZeros = shift > 0 ? '0'.repeat(shift) : '';
      const rawDigits = Array(x.length + 1).fill(' ');
      const carryDigits = Array(x.length + 1).fill(' ');
      let carry = 0;

      const rowIndex = partials.length;
      partials.push({
        digit,
        shift,
        raw: '',
        value: '0'
      });

      function syncDisplays() {
        rowDisplays[rowIndex] = `${rawDigits.join('')}${shiftZeros}`;
        carryDisplays[rowIndex] = `${carryDigits.join('')}${' '.repeat(shift)}`;
      }

      if (digit === 0) {
        cumulativeMul += 1;
        for (let i = x.length - 1; i >= 0; i -= 1) {
          rawDigits[i + 1] = '0';
        }
        syncDisplays();
        pushStep({
          line: 5,
          messageKey: 'step_class_partial_zero',
          messageParams: { shift },
          rowDisplays,
          carryDisplays,
          highlightPartial: rowIndex,
          showTotal: false
        });

        const finalRaw = rowDisplays[rowIndex] || shiftZeros || '0';
        const finalValue = trimLeadingZeros(finalRaw.replace(/\s+/g, ''));
        partials[rowIndex].raw = finalRaw;
        partials[rowIndex].value = finalValue;
        pushStep({
          line: 6,
          messageKey: 'step_class_partial',
          messageParams: { digit, shift },
          rowDisplays,
          carryDisplays,
          highlightPartial: rowIndex,
          showTotal: false
        });
        continue;
      }

      for (let i = x.length - 1; i >= 0; i -= 1) {
        const d = Number(x[i]);
        const p = d * digit;
        cumulativeMul += 1;
        const s = p + carry;
        cumulativeAdd += 1;
        const outDigit = s % 10;
        carry = Math.floor(s / 10);
        rawDigits[i + 1] = String(outDigit);

        if (carry > 0) {
          carryDigits[i] = String(carry);
        }
        syncDisplays();

        pushStep({
          line: 5,
          messageKey: 'step_class_partial_digit',
          messageParams: { digit, pos: x.length - i },
          rowDisplays,
          carryDisplays,
          highlightPartial: rowIndex,
          showTotal: false
        });
      }

      if (carry > 0) {
        rawDigits[0] = String(carry);
        carryDigits[0] = ' ';
        syncDisplays();
        pushStep({
          line: 5,
          messageKey: 'step_class_partial_carry',
          messageParams: { digit },
          rowDisplays,
          carryDisplays,
          highlightPartial: rowIndex,
          showTotal: false
        });
      }

      const finalRaw = rowDisplays[rowIndex] || shiftZeros || '0';
      const finalValue = trimLeadingZeros(finalRaw.replace(/\s+/g, ''));
      partials[rowIndex].raw = finalRaw;
      partials[rowIndex].value = finalValue;
      pushStep({
        line: 6,
        messageKey: 'step_class_partial',
        messageParams: { digit, shift },
        rowDisplays,
        carryDisplays,
        highlightPartial: rowIndex,
        showTotal: false
      });
    }

    const partialValues = partials.map((p) => p.value);
    const sumInfo = sumManyStringsCount(partialValues);
    cumulativeAdd += sumInfo.addOps;

    pushStep({
      line: 7,
      messageKey: 'step_class_sum',
      rowDisplays,
      carryDisplays,
      highlightPartial: -1,
      showTotal: true
    });

    pushStep({
      line: 8,
      messageKey: 'step_class_done',
      rowDisplays,
      carryDisplays,
      highlightPartial: -1,
      showTotal: true
    });

    return {
      algorithm: 'classroom',
      x,
      y,
      n,
      result: sumInfo.sum,
      partials,
      steps,
      powers: {
        x: splitPowerExpr(x),
        y: splitPowerExpr(y)
      }
    };
  }

  function countClassroomOperations(input) {
    const { x, y } = input;
    if (trimLeadingZeros(x) === '0' || trimLeadingZeros(y) === '0') {
      return {
        mul: 1,
        add: 0,
        total: 1
      };
    }

    let mul = 0;
    let add = 0;
    const partialValues = [];

    for (let j = y.length - 1; j >= 0; j -= 1) {
      const digit = Number(y[j]);
      const shift = y.length - 1 - j;
      const shiftZeros = shift > 0 ? '0'.repeat(shift) : '';

      if (digit === 0) {
        mul += 1;
        partialValues.push(trimLeadingZeros(`0${shiftZeros}`));
        continue;
      }

      let carry = 0;
      let out = '';

      for (let i = x.length - 1; i >= 0; i -= 1) {
        const d = Number(x[i]);
        const p = d * digit;
        mul += 1;
        const s = p + carry;
        add += 1;
        out = String(s % 10) + out;
        carry = Math.floor(s / 10);
      }

      while (carry > 0) {
        out = String(carry % 10) + out;
        carry = Math.floor(carry / 10);
      }

      partialValues.push(trimLeadingZeros(`${out}${shiftZeros}`));
    }

    const sumInfo = sumManyStringsCount(partialValues);
    add += sumInfo.addOps;

    return {
      mul,
      add,
      total: mul + add
    };
  }

  function bigIntToString(v) {
    return trimLeadingZeros(v.toString());
  }

  function shiftDecimal(str, k) {
    if (str === '0') return '0';
    return `${str}${'0'.repeat(Math.max(0, k))}`;
  }

  function buildKaratsubaExecution(input) {
    const { x, y, n } = input;
    const nodes = [];
    const steps = [];
    let nextNodeId = 1;

    let cumulativeMul = 0;
    let cumulativeAdd = 0;
    const completed = new Set();

    function pushStep(step) {
      steps.push({
        ...step,
        counts: {
          mul: cumulativeMul,
          add: cumulativeAdd
        },
        completedNodeIds: Array.from(completed)
      });
    }

    function rec(xPart, yPart, parentId, kind, depth) {
      const xRaw = String(xPart || '0');
      const yRaw = String(yPart || '0');
      const xTrim = trimLeadingZeros(xRaw);
      const yTrim = trimLeadingZeros(yRaw);
      const currentN = Math.max(1, xRaw.length, yRaw.length);
      const xNorm = xTrim.padStart(currentN, '0');
      const yNorm = yTrim.padStart(currentN, '0');
      const zeroShortcut = xTrim === '0' || yTrim === '0';
      const oneDigit = currentN === 1;

      const nodeId = nextNodeId;
      nextNodeId += 1;

      const node = {
        id: nodeId,
        parentId,
        kind,
        depth,
        x: xNorm,
        y: yNorm,
        n: currentN,
        leaf: oneDigit || zeroShortcut,
        a: null,
        b: null,
        c: null,
        d: null,
        p: null,
        q: null,
        result: null,
        dropped: [],
        combine: null
      };
      nodes.push(node);

      if (zeroShortcut) {
        cumulativeMul += 1;
        node.result = '0';
        completed.add(nodeId);
        pushStep({
          line: 2,
          activeNodeId: nodeId,
          messageKey: 'step_kar_zero'
        });
        return { value: node.result, nodeId };
      }

      if (oneDigit) {
        const mulValue = Number(xNorm) * Number(yNorm);
        cumulativeMul += 1;
        node.result = String(mulValue);
        completed.add(nodeId);
        pushStep({
          line: 3,
          activeNodeId: nodeId,
          messageKey: 'step_kar_base'
        });
        return { value: node.result, nodeId };
      }

      const m = Math.floor(currentN / 2);
      const highLen = currentN - m;
      const a = xNorm.slice(0, highLen);
      const b = xNorm.slice(highLen);
      const c = yNorm.slice(0, highLen);
      const d = yNorm.slice(highLen);
      node.a = a;
      node.b = b;
      node.c = c;
      node.d = d;
      node.dropped = [`${a}×${d}`, `${b}×${c}`];

      pushStep({
        line: 4,
        activeNodeId: nodeId,
        messageKey: 'step_kar_split',
        messageParams: { a, b, c, d }
      });

      const pInfo = addStringsCount(a, b);
      const qInfo = addStringsCount(c, d);
      node.p = pInfo.sum;
      node.q = qInfo.sum;
      cumulativeAdd += pInfo.addOps + qInfo.addOps;

      pushStep({
        line: 5,
        activeNodeId: nodeId,
        messageKey: 'step_kar_pq'
      });

      pushStep({
        line: 6,
        activeNodeId: nodeId,
        messageKey: 'step_kar_rec_ac'
      });
      const ac = rec(a, c, nodeId, 'ac', depth + 1);

      pushStep({
        line: 7,
        activeNodeId: nodeId,
        messageKey: 'step_kar_rec_bd'
      });
      const bd = rec(b, d, nodeId, 'bd', depth + 1);

      pushStep({
        line: 8,
        activeNodeId: nodeId,
        messageKey: 'step_kar_rec_pq'
      });
      const pq = rec(node.p, node.q, nodeId, 'pq', depth + 1);

      pushStep({
        line: 7,
        activeNodeId: nodeId,
        messageKey: 'step_kar_drop'
      });

      const acStr = trimLeadingZeros(ac.value);
      const bdStr = trimLeadingZeros(bd.value);
      const pqStr = trimLeadingZeros(pq.value);
      const middleBig = BigInt(pqStr) - BigInt(acStr) - BigInt(bdStr);
      const middleStr = bigIntToString(middleBig);

      const part1 = shiftDecimal(acStr, 2 * m);
      const part2 = shiftDecimal(middleStr, m);

      const addCombine1 = addStringsCount(part1, part2);
      const addCombine2 = addStringsCount(addCombine1.sum, bdStr);
      cumulativeAdd += addCombine1.addOps + addCombine2.addOps;

      node.combine = {
        m,
        ac: acStr,
        bd: bdStr,
        pq: pqStr,
        middle: middleStr,
        part1,
        part2
      };
      node.result = addCombine2.sum;
      completed.add(nodeId);

      pushStep({
        line: 8,
        activeNodeId: nodeId,
        messageKey: 'step_kar_combine'
      });

      return {
        value: node.result,
        nodeId
      };
    }

    pushStep({
      line: 1,
      activeNodeId: null,
      messageKey: 'step_kar_prepare'
    });

    const resultObj = rec(x, y, null, 'root', 0);

    pushStep({
      line: 9,
      activeNodeId: resultObj.nodeId,
      messageKey: 'step_kar_done'
    });

    return {
      algorithm: 'karatsuba',
      x,
      y,
      n,
      result: trimLeadingZeros(resultObj.value),
      nodes,
      steps,
      powers: {
        x: splitPowerExpr(x),
        y: splitPowerExpr(y)
      }
    };
  }

  function countKaratsubaOperations(input) {
    const { x, y } = input;
    let mul = 0;
    let add = 0;

    function rec(xPart, yPart) {
      const xRaw = String(xPart || '0');
      const yRaw = String(yPart || '0');
      const xTrim = trimLeadingZeros(xRaw);
      const yTrim = trimLeadingZeros(yRaw);
      const currentN = Math.max(1, xRaw.length, yRaw.length);
      const xNorm = xTrim.padStart(currentN, '0');
      const yNorm = yTrim.padStart(currentN, '0');

      if (xTrim === '0' || yTrim === '0') {
        mul += 1;
        return '0';
      }

      if (currentN === 1) {
        mul += 1;
        return String(Number(xNorm) * Number(yNorm));
      }

      const m = Math.floor(currentN / 2);
      const highLen = currentN - m;
      const a = xNorm.slice(0, highLen);
      const b = xNorm.slice(highLen);
      const c = yNorm.slice(0, highLen);
      const d = yNorm.slice(highLen);

      const pInfo = addStringsCount(a, b);
      const qInfo = addStringsCount(c, d);
      add += pInfo.addOps + qInfo.addOps;

      const ac = rec(a, c);
      const bd = rec(b, d);
      const pq = rec(pInfo.sum, qInfo.sum);

      const acStr = trimLeadingZeros(ac);
      const bdStr = trimLeadingZeros(bd);
      const pqStr = trimLeadingZeros(pq);
      const middleStr = bigIntToString(BigInt(pqStr) - BigInt(acStr) - BigInt(bdStr));

      const part1 = shiftDecimal(acStr, 2 * m);
      const part2 = shiftDecimal(middleStr, m);
      const addCombine1 = addStringsCount(part1, part2);
      const addCombine2 = addStringsCount(addCombine1.sum, bdStr);
      add += addCombine1.addOps + addCombine2.addOps;

      return addCombine2.sum;
    }

    rec(x, y);
    return {
      mul,
      add,
      total: mul + add
    };
  }

  const CLASSROOM_CODE = [
    '1  normalize(x, y) with equal power-of-two length',
    '2  if x == 0 or y == 0: return 0    // one multiplication',
    '3  partials = []',
    '4  for each digit d in y from right to left:',
    '5      row = multiply_by_digit(x, d) and shift by position',
    '6      partials.push(row)',
    '7  result = sum(partials)',
    '8  return result'
  ];

  const KARATSUBA_CODE = [
    '1  karatsuba(x, y):',
    '2      if x == 0 or y == 0: return 0    // one multiplication',
    '3      if one digit: return x·y',
    '4      split x=a·10^m+b and y=c·10^m+d',
    '5      p = a + b ; q = c + d',
    '6      ac = karatsuba(a, c)',
    '7      bd = karatsuba(b, d)',
    '8      pq = karatsuba(p, q)',
    '9      return ac·10^(2m) + (pq-ac-bd)·10^m + bd    // drops ad and bc'
  ];

  window.KaratsubaAlgorithms = {
    prepareNumbers,
    buildClassroomExecution,
    buildKaratsubaExecution,
    countClassroomOperations,
    countKaratsubaOperations,
    CLASSROOM_CODE,
    KARATSUBA_CODE,
    trimLeadingZeros
  };
})();
