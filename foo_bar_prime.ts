function isPrime(num: number): boolean {
  if (num <= 1) return false;
  if (num === 2) return true;
  if (num % 2 === 0) return false;
  const limit = Math.sqrt(num);
  for (let i = 3; i <= limit; i += 2) {
    if (num % i === 0) return false;
  }
  return true;
}

function run(): void {
  const result: string[] = [];

  for (let i = 100; i >= 1; i--) {
    if (isPrime(i)) {
      continue;
    }

    const div3 = i % 3 === 0;
    const div5 = i % 5 === 0;

    if (div3 && div5) {
      result.push('FooBar');
    } else if (div3) {
      result.push('Foo');
    } else if (div5) {
      result.push('Bar');
    } else {
      result.push(i.toString());
    }
  }

  console.log(result.join(' '));
}

run();
