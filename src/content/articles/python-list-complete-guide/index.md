---
title: "Pythonのlist操作を体系的に理解する"
description: "Pythonのlistについて、作成、参照、追加、削除、検索、並べ替え、内包表記、コピー、計算量、典型的なレシピと落とし穴をコード例付きで網羅的に整理します。"
publishedAt: 2026-06-14
category: "Python"
tags:
  - "Python"
  - "list"
  - "データ構造"
  - "アルゴリズム"
draft: false
---

Pythonの`list`は、複数の値を順序付きで保持し、要素を追加・変更・削除できる可変（mutable）なシーケンスです。利用頻度が高い一方で、破壊的操作の戻り値、コピー時の参照共有、先頭への挿入コストなどを理解せずに使うと、不具合や性能低下につながります。

この記事では、日常的な操作から実装上の注意点までを一つの資料として参照できるように整理します。

## 前提条件

| 項目           | 内容                             |
| -------------- | -------------------------------- |
| 対象           | Python組み込み型`list`           |
| 確認バージョン | CPython 3.14.6                   |
| 検証日         | 2026-06-14                       |
| 想定読者       | Pythonの基本構文を理解している人 |

計算量は主にCPythonの実装を前提とします。他のPython実装では内部構造や性能特性が異なる可能性があります。

## listの基本的な性質

`list`には次の性質があります。

- 要素の順序を保持する
- 同じ値を複数保持できる
- 作成後に要素を変更できる
- 異なる型の値を同時に保持できる
- インデックスとスライスで要素へアクセスできる
- 内部では要素そのものではなく、Pythonオブジェクトへの参照を保持する

```python
values = [10, 20, 20, "Python", None]

print(values[0])  # 10
values[1] = 99
print(values)  # [10, 99, 20, 'Python', None]
```

異なる型を混在させることは可能ですが、通常は同じ役割の値をまとめた方が処理しやすくなります。複数の属性を持つデータには、辞書、`dataclass`、タプルなども検討します。

## listを作成する

### リテラル

角括弧で要素を並べる方法が最も一般的です。

```python
empty = []
numbers = [10, 20, 30]
mixed = [1, "two", True]
```

### listコンストラクタ

`list()`は、イテラブルから新しいリストを作ります。

```python
characters = list("Python")
numbers = list(range(5))
keys = list({"name": "Alice", "age": 30})

print(characters)  # ['P', 'y', 't', 'h', 'o', 'n']
print(numbers)  # [0, 1, 2, 3, 4]
print(keys)  # ['name', 'age']
```

辞書を`list()`へ渡した場合は、値ではなくキーが格納されます。値やキー・値の組が必要なら、`values()`または`items()`を使います。

```python
user = {"name": "Alice", "age": 30}

values = list(user.values())
pairs = list(user.items())
```

### 内包表記

既存のイテラブルを変換・抽出してリストを作る場合は、リスト内包表記が有効です。

```python
squares = [number**2 for number in range(6)]
even_squares = [number**2 for number in range(10) if number % 2 == 0]

print(squares)  # [0, 1, 4, 9, 16, 25]
print(even_squares)  # [0, 4, 16, 36, 64]
```

内包表記の基本形は次のとおりです。

```text
[出力する式 for 変数 in イテラブル if 条件]
```

条件分岐によって出力値を変える場合、`if ... else ...`は出力式の位置に置きます。

```python
labels = ["even" if number % 2 == 0 else "odd" for number in range(5)]
```

処理が複雑で副作用を含む場合は、無理に内包表記へ詰め込まず、通常の`for`文を使います。

### 繰り返し演算

`*`で同じ値を繰り返したリストを作れます。

```python
zeros = [0] * 5
print(zeros)  # [0, 0, 0, 0, 0]
```

ただし、可変オブジェクトを繰り返すと、同じオブジェクトへの参照が複製されます。

```python
wrong_matrix = [[0] * 3] * 2
wrong_matrix[0][0] = 1

print(wrong_matrix)  # [[1, 0, 0], [1, 0, 0]]
```

独立した内部リストが必要なら、内包表記で行ごとに作ります。

```python
matrix = [[0] * 3 for _ in range(2)]
matrix[0][0] = 1

print(matrix)  # [[1, 0, 0], [0, 0, 0]]
```

## 要素を参照する

### インデックス

先頭は`0`です。負のインデックスは末尾から数えます。

```python
items = ["a", "b", "c", "d"]

print(items[0])  # a
print(items[2])  # c
print(items[-1])  # d
print(items[-2])  # c
```

範囲外のインデックスを指定すると`IndexError`が発生します。

```python
items[10]  # IndexError
```

空でないことを確認してから参照するか、目的に合った例外処理を行います。

```python
if items:
    first = items[0]
```

### スライス

スライスは`開始:終了:ステップ`の形式です。終了位置の要素は含まれません。

```python
numbers = [0, 1, 2, 3, 4, 5]

print(numbers[1:4])  # [1, 2, 3]
print(numbers[:3])  # [0, 1, 2]
print(numbers[3:])  # [3, 4, 5]
print(numbers[::2])  # [0, 2, 4]
print(numbers[::-1])  # [5, 4, 3, 2, 1, 0]
```

通常のリストに対するスライスは、新しいリストを作ります。大きなリストでは、コピーする要素数に応じた時間とメモリが必要です。

### アンパック

要素数が分かっている場合は、複数の変数へ展開できます。

```python
point = [10, 20]
x, y = point
```

アスタリスク付きの変数は、残りの要素をリストとして受け取ります。

```python
numbers = [1, 2, 3, 4, 5]
first, *middle, last = numbers

print(first)  # 1
print(middle)  # [2, 3, 4]
print(last)  # 5
```

変数の数と要素数が一致せず、アスタリスクもない場合は`ValueError`になります。

## 要素を追加する

### append

末尾へ一つの要素を追加します。渡したオブジェクト全体が一要素になります。

```python
items = [1, 2]
items.append(3)
items.append([4, 5])

print(items)  # [1, 2, 3, [4, 5]]
```

### extend

イテラブルの各要素を末尾へ追加します。

```python
items = [1, 2]
items.extend([3, 4])

print(items)  # [1, 2, 3, 4]
```

`append()`と`extend()`の違いは重要です。

```python
a = [1, 2]
a.append([3, 4])
# [1, 2, [3, 4]]

b = [1, 2]
b.extend([3, 4])
# [1, 2, 3, 4]
```

文字列を`extend()`すると、一文字ずつ追加されます。

```python
characters = ["A"]
characters.extend("BC")

print(characters)  # ['A', 'B', 'C']
```

### insert

指定したインデックスの直前へ挿入します。

```python
items = ["a", "c"]
items.insert(1, "b")

print(items)  # ['a', 'b', 'c']
```

先頭や途中への挿入では、後続要素を移動するため、リストが大きいと高コストです。

### +と+=

`+`は二つのリストを結合した新しいリストを返します。

```python
left = [1, 2]
right = [3, 4]
combined = left + right
```

`+=`は通常、元のリストをその場で拡張します。

```python
items = [1, 2]
alias = items

items += [3, 4]

print(alias)  # [1, 2, 3, 4]
print(items is alias)  # True
```

`items = items + [3, 4]`は新しいリストを作って変数へ再代入するため、参照を共有している場合の挙動が異なります。

## 要素を変更する

### インデックス代入

```python
items = ["a", "b", "c"]
items[1] = "B"

print(items)  # ['a', 'B', 'c']
```

### スライス代入

スライス範囲を別のイテラブルで置き換えます。置換前後の要素数は同じでなくても構いません。

```python
numbers = [0, 1, 2, 3, 4]
numbers[1:4] = [10, 20]

print(numbers)  # [0, 10, 20, 4]
```

挿入にも利用できます。

```python
numbers = [1, 4]
numbers[1:1] = [2, 3]

print(numbers)  # [1, 2, 3, 4]
```

ステップ付きスライスへ代入する場合は、選択される位置の数と代入する要素数を一致させる必要があります。

```python
numbers = [0, 1, 2, 3, 4, 5]
numbers[::2] = [10, 20, 30]
```

## 要素を削除する

### remove

指定した値と等しい最初の要素を削除します。

```python
items = ["a", "b", "a"]
items.remove("a")

print(items)  # ['b', 'a']
```

値が存在しない場合は`ValueError`が発生します。

```python
if target in items:
    items.remove(target)
```

存在確認と削除の間に別処理が割り込む可能性があるコードでは、例外処理の方が適切な場合があります。

### pop

指定した位置の要素を削除し、その値を返します。省略時は末尾です。

```python
items = ["a", "b", "c"]

last = items.pop()
first = items.pop(0)

print(last)  # c
print(first)  # a
```

空のリストや範囲外の位置では`IndexError`が発生します。

### del

インデックスまたはスライスで削除します。値は返しません。

```python
items = ["a", "b", "c", "d"]

del items[1]
del items[1:3]

print(items)  # ['a']
```

### clear

全要素を削除し、同じリストオブジェクトを空にします。

```python
items = [1, 2, 3]
alias = items

items.clear()

print(alias)  # []
print(items is alias)  # True
```

`items = []`は変数を新しい空リストへ付け替えるだけです。他の変数が参照する元リストは変更されません。

```python
items = [1, 2, 3]
alias = items

items = []

print(alias)  # [1, 2, 3]
```

### 条件に一致する要素をまとめて削除する

ループ中のリストを直接変更すると、要素を飛ばすことがあります。

```python
# 避ける
numbers = [1, 2, 2, 3, 4]
for number in numbers:
    if number % 2 == 0:
        numbers.remove(number)
```

新しいリストを作る方が明確です。

```python
numbers = [1, 2, 2, 3, 4]
numbers = [number for number in numbers if number % 2 != 0]
```

同じリストオブジェクトを維持する必要がある場合は、全体へのスライス代入を使えます。

```python
numbers[:] = [number for number in numbers if number % 2 != 0]
```

## 検索と集計

### inとnot in

値が含まれるかを調べます。

```python
names = ["Alice", "Bob", "Carol"]

print("Bob" in names)  # True
print("Dave" not in names)  # True
```

リストの所属判定は先頭から順に比較するため、平均・最悪ともに`O(n)`です。大量の所属判定を行う場合は、`set`の利用を検討します。

```python
allowed_names = set(names)
if name in allowed_names:
    ...
```

### index

値と等しい最初の要素の位置を返します。

```python
items = ["a", "b", "a", "c"]

print(items.index("a"))  # 0
print(items.index("a", 1))  # 2
```

見つからない場合は`ValueError`です。

### count

指定した値の出現回数を返します。

```python
items = ["a", "b", "a", "c"]
print(items.count("a"))  # 2
```

複数の値を一度に集計するなら、値ごとに`count()`を繰り返すより`collections.Counter`が適しています。

```python
from collections import Counter

counts = Counter(["red", "blue", "red", "green", "blue", "red"])
print(counts.most_common(2))  # [('red', 3), ('blue', 2)]
```

### len、min、max、sum

```python
numbers = [10, 20, 30]

print(len(numbers))  # 3
print(min(numbers))  # 10
print(max(numbers))  # 30
print(sum(numbers))  # 60
```

空リストに対する`min()`と`max()`は`ValueError`になります。`sum([])`は`0`です。

### anyとall

`any()`は一つでも真なら`True`、`all()`はすべて真なら`True`を返します。

```python
scores = [65, 82, 91]

has_high_score = any(score >= 90 for score in scores)
all_passed = all(score >= 60 for score in scores)
```

空のイテラブルに対して、`any([])`は`False`、`all([])`は`True`です。

## 並べ替える

### sort

`list.sort()`は元のリストをその場で並べ替え、`None`を返します。

```python
numbers = [3, 1, 2]
result = numbers.sort()

print(numbers)  # [1, 2, 3]
print(result)  # None
```

次の書き方は、`items`へ`None`を代入してしまいます。

```python
# 誤り
items = items.sort()
```

### sorted

`sorted()`は任意のイテラブルを受け取り、新しいリストを返します。元のリストは変更しません。

```python
numbers = [3, 1, 2]
ordered = sorted(numbers)

print(numbers)  # [3, 1, 2]
print(ordered)  # [1, 2, 3]
```

### key

`key`には、各要素から比較用の値を取り出す関数を指定します。

```python
words = ["banana", "fig", "apple", "kiwi"]
words.sort(key=len)

print(words)  # ['fig', 'kiwi', 'apple', 'banana']
```

辞書のリストを複数条件で並べ替える例です。

```python
users = [
    {"name": "Bob", "age": 30},
    {"name": "Alice", "age": 30},
    {"name": "Carol", "age": 25},
]

users.sort(key=lambda user: (user["age"], user["name"]))
```

属性やインデックスを取り出すだけなら、`operator.attrgetter()`や`operator.itemgetter()`も使えます。

```python
from operator import itemgetter

users.sort(key=itemgetter("age", "name"))
```

### reverse

`reverse=True`で降順にします。

```python
numbers = [3, 1, 2]
numbers.sort(reverse=True)
```

`list.reverse()`は現在の並び順をその場で反転します。

```python
numbers.reverse()
```

`reversed()`は逆順に走査するイテレータを返し、元のリストを変更しません。

```python
for number in reversed(numbers):
    print(number)

reversed_list = list(reversed(numbers))
```

### ソートの安定性

Pythonのソートは安定です。比較キーが同じ要素は、元の相対順序を維持します。

```python
records = [
    ("Alice", "B"),
    ("Bob", "A"),
    ("Carol", "B"),
]

records.sort(key=lambda record: record[1])
# [('Bob', 'A'), ('Alice', 'B'), ('Carol', 'B')]
```

異なる型をそのまま比較できない場合があります。

```python
values = [10, "20", None]
values.sort()  # TypeError
```

比較可能な共通キーへ変換するか、データ型を統一します。

## ループ処理

### 要素を順番に処理する

```python
for item in items:
    print(item)
```

インデックスだけを目的に`range(len(items))`を使う必要はありません。

### インデックスも取得する

`enumerate()`を使います。

```python
names = ["Alice", "Bob", "Carol"]

for index, name in enumerate(names):
    print(index, name)
```

開始番号も指定できます。

```python
for number, name in enumerate(names, start=1):
    print(number, name)
```

### 複数のリストを同時に処理する

`zip()`を使います。

```python
names = ["Alice", "Bob"]
scores = [90, 80]

for name, score in zip(names, scores, strict=True):
    print(name, score)
```

通常の`zip()`は、最も短いイテラブルに合わせて終了します。要素数の違いを不具合として検出したい場合は、`strict=True`を指定します。

### 反復中に要素を書き換える

インデックスが必要なら`enumerate()`を使います。

```python
numbers = [1, 2, 3]

for index, number in enumerate(numbers):
    numbers[index] = number * 2
```

単純な変換なら、新しいリストを作る方が意図を表しやすくなります。

```python
numbers = [number * 2 for number in numbers]
```

## コピーと参照

### 代入はコピーではない

リストを別の変数へ代入すると、同じオブジェクトを参照します。

```python
original = [1, 2, 3]
alias = original

alias.append(4)

print(original)  # [1, 2, 3, 4]
print(alias is original)  # True
```

### 浅いコピー

次の方法は、外側のリストだけを複製します。

```python
copy_a = original.copy()
copy_b = original[:]
copy_c = list(original)
```

内部に可変オブジェクトがある場合、その参照は共有されます。

```python
original = [[1, 2], [3, 4]]
shallow = original.copy()

shallow[0].append(99)

print(original)  # [[1, 2, 99], [3, 4]]
```

### 深いコピー

入れ子の可変オブジェクトも再帰的に複製するには`copy.deepcopy()`を使います。

```python
from copy import deepcopy

original = [[1, 2], [3, 4]]
independent = deepcopy(original)

independent[0].append(99)

print(original)  # [[1, 2], [3, 4]]
```

深いコピーは、共有するべきオブジェクトまで複製し、時間とメモリを多く使う場合があります。必要な部分だけを明示的に作り直す方法も検討します。

## 比較と真偽値

空のリストは偽、それ以外は真として扱われます。

```python
items = []

if not items:
    print("空です")
```

`items == []`や`len(items) == 0`より、通常は`if not items`が簡潔です。

リスト同士の比較は辞書順です。先頭から要素を比較し、最初に異なる要素で結果が決まります。

```python
print([1, 2, 3] < [1, 3, 0])  # True
print([1, 2] < [1, 2, 0])  # True
```

`==`は内容の等価性、`is`は同じオブジェクトかを調べます。

```python
a = [1, 2]
b = [1, 2]
c = a

print(a == b)  # True
print(a is b)  # False
print(a is c)  # True
```

値の比較に`is`を使わないでください。`None`との比較には`is None`を使います。

## 型ヒント

Python 3.9以降では、要素型を`list[型]`で表せます。

```python
def normalize_names(names: list[str]) -> list[str]:
    return [name.strip().title() for name in names]
```

関数がリスト固有の変更操作を必要とせず、読み取りだけを行う場合は、より広い`Sequence`や`Iterable`を受け取る設計も検討します。

```python
from collections.abc import Iterable, Sequence


def total(values: Iterable[int]) -> int:
    return sum(values)


def first(values: Sequence[str]) -> str:
    return values[0]
```

呼び出し側から渡されたリストを変更する関数は、その事実が分かる名前やドキュメントにします。変更不要なら新しいリストを返す方が、副作用を予測しやすくなります。

## 主な操作の計算量

CPythonの`list`は動的配列として実装されています。

| 操作                     | 平均的な計算量 | 説明                         |
| ------------------------ | -------------- | ---------------------------- |
| `len(items)`             | `O(1)`         | 要素数は保持されている       |
| `items[index]`           | `O(1)`         | インデックスで直接参照       |
| `items[index] = value`   | `O(1)`         | 指定位置の参照を変更         |
| `items.append(value)`    | 償却`O(1)`     | 容量不足時は再確保が発生     |
| `items.pop()`            | `O(1)`         | 末尾を削除                   |
| `items.insert(0, value)` | `O(n)`         | 後続要素を移動               |
| `items.pop(0)`           | `O(n)`         | 後続要素を移動               |
| `value in items`         | `O(n)`         | 先頭から線形検索             |
| `items.index(value)`     | `O(n)`         | 先頭から線形検索             |
| `items.remove(value)`    | `O(n)`         | 検索後に後続要素を移動       |
| `items.copy()`           | `O(n)`         | 全参照を新しいリストへコピー |
| `items[start:stop]`      | `O(k)`         | `k`個の要素をコピー          |
| `items + other`          | `O(n + m)`     | 新しいリストを作成           |
| `items.sort()`           | `O(n log n)`   | Timsortによる安定ソート      |

`append()`は常に同じ時間ではありません。将来の追加に備えて余分な容量を確保し、容量不足時により大きな領域へ移すことで、複数回の操作を平均した償却`O(1)`を実現します。

## listをスタックとして使う

末尾への`append()`と`pop()`を組み合わせると、LIFOのスタックになります。

```python
stack: list[str] = []

stack.append("first")
stack.append("second")

latest = stack.pop()
print(latest)  # second
```

どちらも末尾を操作するため効率的です。

## キューにはdequeを使う

FIFOのキューとして`pop(0)`を繰り返すと、残りの要素を毎回移動するため`O(n)`かかります。

```python
# 大きなキューでは避ける
queue = ["first", "second", "third"]
item = queue.pop(0)
```

両端の追加・削除を概ね`O(1)`で行える`collections.deque`を使います。

```python
from collections import deque

queue: deque[str] = deque()
queue.append("first")
queue.append("second")

item = queue.popleft()
print(item)  # first
```

## よく使う実践レシピ

### 順序を保って重複を削除する

要素がハッシュ可能なら、辞書のキーを利用できます。

```python
items = ["a", "b", "a", "c", "b"]
unique = list(dict.fromkeys(items))

print(unique)  # ['a', 'b', 'c']
```

単純に`list(set(items))`とすると、元の順序を前提にできません。

### 入れ子を一段平坦化する

```python
nested = [[1, 2], [3, 4], [5]]
flat = [item for group in nested for item in group]

print(flat)  # [1, 2, 3, 4, 5]
```

深さが不定の入れ子には、再帰処理や専用のデータ構造が必要です。

### 一定サイズに分割する

Python 3.12以降では`itertools.batched()`を利用できます。

```python
from itertools import batched

items = [1, 2, 3, 4, 5]
batches = [list(batch) for batch in batched(items, 2)]

print(batches)  # [[1, 2], [3, 4], [5]]
```

最後のグループも指定サイズであることを必須にする場合、Python 3.13以降では`strict=True`を指定できます。

```python
batches = list(batched(items, 2, strict=True))  # ValueError
```

### 条件に合う最初の要素を取得する

```python
users = [
    {"name": "Alice", "active": False},
    {"name": "Bob", "active": True},
]

active_user = next((user for user in users if user["active"]), None)
```

リスト全体を作る必要がないため、最初の一件だけならジェネレータ式と`next()`が適しています。

### 複数リストを行列のように転置する

```python
matrix = [
    [1, 2, 3],
    [4, 5, 6],
]

transposed = [list(column) for column in zip(*matrix, strict=True)]

print(transposed)  # [[1, 4], [2, 5], [3, 6]]
```

### 連続する要素の組を処理する

Python 3.10以降では`itertools.pairwise()`を使えます。

```python
from itertools import pairwise

values = [10, 13, 18, 20]
differences = [current - previous for previous, current in pairwise(values)]

print(differences)  # [3, 5, 2]
```

### 条件ごとに二つへ分ける

```python
numbers = [1, 2, 3, 4, 5]

even = [number for number in numbers if number % 2 == 0]
odd = [number for number in numbers if number % 2 != 0]
```

非常に大きなデータで同じ条件判定が高コストなら、一度のループで振り分けます。

```python
even = []
odd = []

for number in numbers:
    destination = even if number % 2 == 0 else odd
    destination.append(number)
```

## 破壊的操作と非破壊的操作

元のリストを変更する操作と、新しいリストを返す操作を区別することが重要です。

| 目的     | 元を変更する                       | 新しいリストを返す                     |
| -------- | ---------------------------------- | -------------------------------------- |
| 追加     | `append`、`extend`、`insert`、`+=` | `+`、内包表記                          |
| 削除     | `remove`、`pop`、`clear`、`del`    | 条件付き内包表記                       |
| 並べ替え | `sort`                             | `sorted`                               |
| 反転     | `reverse`                          | `list(reversed(items))`、`items[::-1]` |
| コピー   | 該当なし                           | `copy`、`items[:]`、`list(items)`      |

`append()`、`extend()`、`insert()`、`remove()`、`clear()`、`sort()`、`reverse()`など、リストをその場で変更するメソッドは通常`None`を返します。

## list以外を選ぶ場面

すべてのデータを`list`で扱う必要はありません。

| 要件                             | 候補                     |
| -------------------------------- | ------------------------ |
| 変更しない固定データ             | `tuple`                  |
| 高速な所属判定、重複排除         | `set`                    |
| キーから値を取得                 | `dict`                   |
| 先頭と末尾を頻繁に追加・削除     | `collections.deque`      |
| 頻度集計                         | `collections.Counter`    |
| 最小値・最大値を繰り返し取り出す | `heapq`                  |
| ソート済みリストへ挿入・検索     | `bisect`                 |
| 大量の同型数値を効率的に計算     | `array`、NumPy配列       |
| 全要素を同時に保持したくない     | ジェネレータ、イテレータ |

目的に合うデータ構造を選ぶことは、細かなコード最適化より大きな効果を持ちます。

## 典型的な落とし穴

### 破壊的メソッドの戻り値を代入する

```python
# 誤り
numbers = [3, 1, 2]
numbers = numbers.sort()
```

`numbers`は`None`になります。

```python
# 正しい
numbers.sort()

# または
ordered = sorted(numbers)
```

### 代入をコピーだと思う

```python
copied = original
```

これは同じリストへの別名です。独立した外側のリストが必要なら`original.copy()`を使います。

### 二次元リストを\*で作る

```python
# 各行が同じリストを参照する
matrix = [[0] * width] * height
```

```python
# 行ごとに別のリストを作る
matrix = [[0] * width for _ in range(height)]
```

### ループ中に同じリストの長さを変える

削除対象を飛ばしたり、処理順が分かりにくくなったりします。新しいリストを作る、コピーを走査する、または後ろから削除します。

### pop(0)をキューとして多用する

先頭削除は`O(n)`です。`deque.popleft()`へ変更します。

### inを大量に繰り返す

リストの所属判定は`O(n)`です。順序が不要で要素がハッシュ可能なら、検索用に`set`を用意します。

```python
blocked_list = ["A", "B", "C"]
blocked_set = set(blocked_list)

for value in many_values:
    if value in blocked_set:
        ...
```

### 内包表記を複雑にしすぎる

複数の副作用、深い入れ子、長い条件式を含む内包表記は、短くても読みやすいとは限りません。処理の段階や意図を説明する必要がある場合は、通常のループへ分解します。

### listを関数のデフォルト引数にする

デフォルト引数は関数定義時に一度だけ評価され、呼び出し間で同じリストが共有されます。

```python
# 避ける
def add_item(item, items=[]):
    items.append(item)
    return items
```

`None`を既定値にします。

```python
def add_item(item: str, items: list[str] | None = None) -> list[str]:
    if items is None:
        items = []

    items.append(item)
    return items
```

### 必要のないlist化

`sum()`、`any()`、`all()`などはイテラブルを直接受け取れます。中間リストが不要ならジェネレータ式を使うことで、メモリ使用量を抑えられます。

```python
# 中間リストを作る
total = sum([number**2 for number in range(1_000_000)])

# 一つずつ生成する
total = sum(number**2 for number in range(1_000_000))
```

## 操作を選ぶためのチェックリスト

- 元のリストを変更してよいか
- 他の変数と同じリストを参照していないか
- 内部に可変オブジェクトがあるか
- 順序と重複を保持する必要があるか
- 先頭への追加・削除を繰り返さないか
- 所属判定を大量に繰り返さないか
- 中間リストを作らずイテレータで処理できないか
- `sort()`と`sorted()`を目的に応じて選んでいるか
- ループ中に走査対象の長さを変えていないか
- `list`以外のデータ構造の方が適していないか

## まとめ

Pythonの`list`を安全に使うための中心的な判断は、次の3点です。

1. **変更か新規作成かを区別する**  
   `sort()`、`append()`などは元のリストを変更し、通常`None`を返します。`sorted()`、内包表記、`+`などは新しいリストを作ります。
2. **値ではなく参照を保持していると理解する**  
   代入はコピーではありません。浅いコピーでは内部の可変オブジェクトが共有されます。
3. **操作に合ったデータ構造を選ぶ**  
   末尾操作は得意ですが、先頭操作や大量の所属判定には`deque`や`set`の方が適しています。

メソッドを暗記するだけでなく、元のオブジェクトが変更されるか、計算量がどの程度か、参照が共有されるかを確認すると、`list`に関する多くの不具合を避けられます。

## 参考資料

- [Python Tutorial: Data Structures](https://docs.python.org/3/tutorial/datastructures.html)
- [Python Standard Library: Sequence Types — list, tuple, range](https://docs.python.org/3/library/stdtypes.html#sequence-types-list-tuple-range)
- [Python Sorting HOW TO](https://docs.python.org/3/howto/sorting.html)
- [Python Standard Library: copy](https://docs.python.org/3/library/copy.html)
- [Python Standard Library: collections.deque](https://docs.python.org/3/library/collections.html#collections.deque)
- [Python Standard Library: itertools](https://docs.python.org/3/library/itertools.html)
- [Python Standard Library: typing](https://docs.python.org/3/library/typing.html)
- [Python Wiki: TimeComplexity](https://wiki.python.org/moin/TimeComplexity)
