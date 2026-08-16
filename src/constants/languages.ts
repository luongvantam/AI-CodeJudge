import type { LanguageConfig } from '../types/judge';

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  // C++ Family
  {
    id: 'cpp20',
    name: 'C++20 (GCC)',
    category: 'C/C++',
    monacoLang: 'cpp',
    extension: 'cpp',
    piston: { language: 'c++', version: '10.2.0' },
    judge0Id: 54, // GCC 9.2.0 / C++20
    boilerplate: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    if (cin >> n) {
        vector<long long> a(n);
        long long sum = 0;
        for (int i = 0; i < n; i++) {
            cin >> a[i];
            sum += a[i];
        }
        cout << sum << "\\n";
    }
    return 0;
}
`,
  },
  {
    id: 'cpp17',
    name: 'C++17 (GCC)',
    category: 'C/C++',
    monacoLang: 'cpp',
    extension: 'cpp',
    piston: { language: 'c++', version: '10.2.0' },
    judge0Id: 54,
    boilerplate: `#include <iostream>
#include <vector>
#include <numeric>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    if (cin >> n) {
        vector<long long> a(n);
        long long sum = 0;
        for (int i = 0; i < n; i++) {
            cin >> a[i];
            sum += a[i];
        }
        cout << sum << "\\n";
    }
    return 0;
}
`,
  },
  {
    id: 'cpp14',
    name: 'C++14 (GCC)',
    category: 'C/C++',
    monacoLang: 'cpp',
    extension: 'cpp',
    piston: { language: 'c++', version: '10.2.0' },
    judge0Id: 54,
    boilerplate: `#include <iostream>
#include <vector>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    if (cin >> n) {
        long long sum = 0, x;
        for (int i = 0; i < n; i++) {
            cin >> x;
            sum += x;
        }
        cout << sum << "\\n";
    }
    return 0;
}
`,
  },
  {
    id: 'cpp11',
    name: 'C++11 (GCC)',
    category: 'C/C++',
    monacoLang: 'cpp',
    extension: 'cpp',
    piston: { language: 'c++', version: '10.2.0' },
    judge0Id: 53,
    boilerplate: `#include <iostream>
#include <vector>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    if (cin >> n) {
        long long sum = 0, x;
        for (int i = 0; i < n; i++) {
            cin >> x;
            sum += x;
        }
        cout << sum << "\\n";
    }
    return 0;
}
`,
  },
  {
    id: 'cpp03',
    name: 'C++03 (GCC)',
    category: 'C/C++',
    monacoLang: 'cpp',
    extension: 'cpp',
    piston: { language: 'c++', version: '10.2.0' },
    judge0Id: 52,
    boilerplate: `#include <iostream>
#include <cstdio>

using namespace std;

int main() {
    int n;
    if (scanf("%d", &n) == 1) {
        long long sum = 0;
        for (int i = 0; i < n; i++) {
            long long x;
            scanf("%lld", &x);
            sum += x;
        }
        printf("%lld\\n", sum);
    }
    return 0;
}
`,
  },
  // C Family
  {
    id: 'c11',
    name: 'C11 (GCC)',
    category: 'C/C++',
    monacoLang: 'c',
    extension: 'c',
    piston: { language: 'c', version: '10.2.0' },
    judge0Id: 50,
    boilerplate: `#include <stdio.h>

int main() {
    int n;
    if (scanf("%d", &n) == 1) {
        long long sum = 0;
        for (int i = 0; i < n; i++) {
            long long x;
            scanf("%lld", &x);
            sum += x;
        }
        printf("%lld\\n", sum);
    }
    return 0;
}
`,
  },
  {
    id: 'c',
    name: 'C (GCC 9.2)',
    category: 'C/C++',
    monacoLang: 'c',
    extension: 'c',
    piston: { language: 'c', version: '10.2.0' },
    judge0Id: 50,
    boilerplate: `#include <stdio.h>

int main() {
    int n;
    if (scanf("%d", &n) == 1) {
        long long sum = 0;
        for (int i = 0; i < n; i++) {
            long long x;
            scanf("%lld", &x);
            sum += x;
        }
        printf("%lld\\n", sum);
    }
    return 0;
}
`,
  },
  // Python Family
  {
    id: 'python3',
    name: 'Python 3 (3.10+)',
    category: 'Python',
    monacoLang: 'python',
    extension: 'py',
    piston: { language: 'python', version: '3.10.0' },
    judge0Id: 71,
    boilerplate: `import sys

def solve():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    n = int(input_data[0])
    a = [int(x) for x in input_data[1:n+1]]
    print(sum(a))

if __name__ == '__main__':
    solve()
`,
  },
  {
    id: 'pypy3',
    name: 'PyPy 3',
    category: 'Python',
    monacoLang: 'python',
    extension: 'py',
    piston: { language: 'python', version: '3.10.0' },
    judge0Id: 73,
    boilerplate: `import sys

def solve():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    n = int(input_data[0])
    a = [int(x) for x in input_data[1:n+1]]
    print(sum(a))

if __name__ == '__main__':
    solve()
`,
  },
  {
    id: 'python2',
    name: 'Python 2.7',
    category: 'Python',
    monacoLang: 'python',
    extension: 'py',
    piston: { language: 'python2', version: '2.7.18' },
    judge0Id: 70,
    boilerplate: `import sys

def solve():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    n = int(input_data[0])
    a = [int(x) for x in input_data[1:n+1]]
    print sum(a)

if __name__ == '__main__':
    solve()
`,
  },
  {
    id: 'pypy2',
    name: 'PyPy 2',
    category: 'Python',
    monacoLang: 'python',
    extension: 'py',
    piston: { language: 'python2', version: '2.7.18' },
    judge0Id: 70,
    boilerplate: `import sys

def solve():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    n = int(input_data[0])
    a = [int(x) for x in input_data[1:n+1]]
    print sum(a)

if __name__ == '__main__':
    solve()
`,
  },
  // Pascal Family
  {
    id: 'pascal',
    name: 'Pascal (Free Pascal 3.x)',
    category: 'Pascal',
    monacoLang: 'pascal',
    extension: 'pas',
    piston: { language: 'pascal', version: '3.2.2' },
    judge0Id: 67,
    boilerplate: `program SumArray;
var
  n, i: longint;
  x, sum: int64;
begin
  sum := 0;
  if not eof then
  begin
    read(n);
    for i := 1 to n do
    begin
      read(x);
      sum := sum + x;
    end;
    writeln(sum);
  end;
end.
`,
  },
  // Java & Others
  {
    id: 'java',
    name: 'Java (OpenJDK 13+)',
    category: 'Other',
    monacoLang: 'java',
    extension: 'java',
    piston: { language: 'java', version: '15.0.2' },
    judge0Id: 62,
    boilerplate: `import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.StringTokenizer;

public class Main {
    public static void main(String[] args) throws Exception {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();
        if (line == null) return;
        
        int n = Integer.parseInt(line.trim());
        StringTokenizer st = new StringTokenizer(br.readLine());
        long sum = 0;
        for (int i = 0; i < n; i++) {
            sum += Long.parseLong(st.nextToken());
        }
        System.out.println(sum);
    }
}
`,
  },
  {
    id: 'rust',
    name: 'Rust (1.68+)',
    category: 'Other',
    monacoLang: 'rust',
    extension: 'rs',
    piston: { language: 'rust', version: '1.68.2' },
    judge0Id: 73,
    boilerplate: `use std::io::{self, Read};

fn main() {
    let mut input = String::new();
    if io::stdin().read_to_string(&mut input).is_ok() {
        let mut words = input.split_whitespace();
        if let Some(n_str) = words.next() {
            let n: usize = n_str.parse().unwrap_or(0);
            let mut sum: i64 = 0;
            for _ in 0..n {
                if let Some(num_str) = words.next() {
                    let num: i64 = num_str.parse().unwrap_or(0);
                    sum += num;
                }
            }
            println!("{}", sum);
        }
    }
}
`,
  },
  {
    id: 'go',
    name: 'Go (1.16+)',
    category: 'Other',
    monacoLang: 'go',
    extension: 'go',
    piston: { language: 'go', version: '1.16.2' },
    judge0Id: 60,
    boilerplate: `package main

import (
    "bufio"
    "fmt"
    "os"
)

func main() {
    in := bufio.NewReader(os.Stdin)
    var n int
    if _, err := fmt.Fscan(in, &n); err == nil {
        var sum int64 = 0
        for i := 0; i < n; i++ {
            var x int64
            fmt.Fscan(in, &x)
            sum += x
        }
        fmt.Println(sum)
    }
}
`,
  }
];

export const DEFAULT_LANGUAGE = SUPPORTED_LANGUAGES[0];
