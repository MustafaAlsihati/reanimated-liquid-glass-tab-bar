const test = require('node:test');
const assert = require('node:assert/strict');
const { createTabBarCollapse, resolveScroll } = require('../lib/commonjs/collapse-core.js');

// A stand-in for a Reanimated shared value: records what it is set to.
function fakeProgress() {
  const sets = [];
  return { sets, set: value => sets.push(value), get: () => sets.at(-1) ?? 0 };
}

test('createTabBarCollapse animates to 1 and back to 0', () => {
  const progress = fakeProgress();
  const collapse = createTabBarCollapse(progress, value => value * 10);

  assert.equal(collapse.isCollapsed(), false);
  collapse.setCollapsed(true);
  assert.equal(collapse.isCollapsed(), true);
  collapse.setCollapsed(false);
  assert.equal(collapse.isCollapsed(), false);
  assert.deepEqual(progress.sets, [10, 0]);
});

test('setCollapsed does nothing when the state does not change', () => {
  const progress = fakeProgress();
  const collapse = createTabBarCollapse(progress, value => value);

  collapse.setCollapsed(false);
  collapse.setCollapsed(true);
  collapse.setCollapsed(true);
  collapse.setCollapsed(true);
  assert.deepEqual(progress.sets, [1]);
});

test('scrolling down past the offset collapses', () => {
  assert.deepEqual(resolveScroll(0, 40), { lastOffset: 40, collapsed: true });
});

test('scrolling down before the offset does nothing but is counted', () => {
  assert.deepEqual(resolveScroll(0, 10), { lastOffset: 10, collapsed: undefined });
});

test('scrolling up expands', () => {
  assert.deepEqual(resolveScroll(100, 80), { lastOffset: 80, collapsed: false });
});

test('reaching the top expands', () => {
  assert.deepEqual(resolveScroll(2, 0, { minDelta: 1 }), { lastOffset: 0, collapsed: false });
  // Pull-to-refresh style overscroll
  assert.deepEqual(resolveScroll(30, -20), { lastOffset: -20, collapsed: false });
});

test('movement under minDelta is ignored and not counted', () => {
  assert.deepEqual(resolveScroll(100, 102), { lastOffset: 100, collapsed: undefined });
});

test('a slow drag adds up against the last counted offset', () => {
  let state = { lastOffset: 100, collapsed: undefined };
  // 3px per event: each is under minDelta alone, together they pass it
  state = resolveScroll(state.lastOffset, 103);
  assert.equal(state.collapsed, undefined);
  state = resolveScroll(state.lastOffset, 106);
  assert.deepEqual(state, { lastOffset: 106, collapsed: true });
});

test('options change the thresholds', () => {
  assert.equal(resolveScroll(0, 40, { collapseOffset: 100 }).collapsed, undefined);
  assert.equal(resolveScroll(0, 40, { collapseOffset: 10 }).collapsed, true);
  assert.equal(resolveScroll(100, 108, { minDelta: 10 }).collapsed, undefined);
});
