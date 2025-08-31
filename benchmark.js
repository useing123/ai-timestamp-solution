/**
 * Performance benchmark test for timestamp implementations
 * Compares standard vs fast implementations across various metrics
 */

import { 
  generateTimestamp48, 
  generateTimestamp48Fast,
  decodeTimestamp48,
  generateBatch
} from './timestamp.js';

const BENCHMARK_RUNS = 100000;
const WARM_UP_RUNS = 1000;

function benchmark(name, fn, runs = BENCHMARK_RUNS) {
  // Warm up
  for (let i = 0; i < WARM_UP_RUNS; i++) {
    fn();
  }
  
  // Actual benchmark
  const start = performance.now();
  for (let i = 0; i < runs; i++) {
    fn();
  }
  const end = performance.now();
  
  const totalTime = end - start;
  const opsPerSec = Math.round(runs / (totalTime / 1000));
  
  console.log(`${name}:`);
  console.log(`  📊 Total time: ${totalTime.toFixed(2)}ms`);
  console.log(`  📊 Ops/sec: ${opsPerSec.toLocaleString()}`);
  console.log(`  📊 Avg time per op: ${(totalTime / runs * 1000).toFixed(3)}μs`);
  
  return { totalTime, opsPerSec, avgTime: totalTime / runs };
}

function memoryTest(name, fn, iterations = 10000) {
  if (typeof process === 'undefined') {
    console.log(`${name}: Memory test skipped (Node.js only)`);
    return;
  }
  
  const beforeMem = process.memoryUsage();
  const results = [];
  
  for (let i = 0; i < iterations; i++) {
    results.push(fn());
  }
  
  const afterMem = process.memoryUsage();
  const heapUsed = afterMem.heapUsed - beforeMem.heapUsed;
  
  console.log(`${name}:`);
  console.log(`  📊 Memory used: ${Math.round(heapUsed / 1024)}KB`);
  console.log(`  📊 Per operation: ${Math.round(heapUsed / iterations)}B`);
  console.log(`  📊 Results length: ${results.length}`);
}

console.log('🚀 Starting Comprehensive Performance Benchmark\n');
console.log('='.repeat(60));

// Single operation benchmarks
console.log('📋 Single Operation Performance');
console.log('-'.repeat(40));

const standard = benchmark('generateTimestamp48()', generateTimestamp48);
const fast = benchmark('generateTimestamp48Fast()', generateTimestamp48Fast);

const improvement = ((fast.opsPerSec / standard.opsPerSec - 1) * 100).toFixed(1);
console.log(`\n🔥 Performance improvement: ${improvement}% faster\n`);

// Decode performance
console.log('📋 Decode Performance');
console.log('-'.repeat(40));

const sampleTimestamp = generateTimestamp48();
benchmark('decodeTimestamp48()', () => decodeTimestamp48(sampleTimestamp));

// Batch performance
console.log('\n📋 Batch Generation Performance');
console.log('-'.repeat(40));

benchmark('generateBatch(100, {fast: false})', () => generateBatch(100, {fast: false}), 1000);
benchmark('generateBatch(100, {fast: true})', () => generateBatch(100, {fast: true}), 1000);

// Memory usage tests
console.log('\n📋 Memory Usage Analysis');
console.log('-'.repeat(40));

memoryTest('Standard Implementation Memory', generateTimestamp48);
memoryTest('Fast Implementation Memory', generateTimestamp48Fast);

// Accuracy test
console.log('\n📋 Accuracy Verification');
console.log('-'.repeat(40));

let standardSum = 0, fastSum = 0, diffSum = 0;
const accuracyRuns = 1000;

for (let i = 0; i < accuracyRuns; i++) {
  const std = generateTimestamp48();
  const fst = generateTimestamp48Fast();
  const stdDecoded = decodeTimestamp48(std);
  const fstDecoded = decodeTimestamp48(fst);
  
  standardSum += stdDecoded;
  fastSum += fstDecoded;
  diffSum += Math.abs(stdDecoded - fstDecoded);
}

console.log('Accuracy Test:');
console.log(`  📊 Average difference: ${(diffSum / accuracyRuns).toFixed(3)}ms`);
console.log(`  📊 Standard avg timestamp: ${Math.round(standardSum / accuracyRuns)}`);
console.log(`  📊 Fast avg timestamp: ${Math.round(fastSum / accuracyRuns)}`);

// Validation tests
console.log('\n📋 Format Validation');
console.log('-'.repeat(40));

const BASE64URL_REGEX = /^[A-Za-z0-9_-]{8}$/;
let validCount = 0;

for (let i = 0; i < 1000; i++) {
  const ts1 = generateTimestamp48();
  const ts2 = generateTimestamp48Fast();
  
  if (BASE64URL_REGEX.test(ts1) && ts1.length === 8) validCount++;
  if (BASE64URL_REGEX.test(ts2) && ts2.length === 8) validCount++;
}

console.log('Format Validation:');
console.log(`  📊 Valid formats: ${validCount}/2000 (${(validCount/2000*100).toFixed(1)}%)`);

console.log('\n' + '='.repeat(60));
console.log('🎉 Benchmark Complete!');
console.log('='.repeat(60));