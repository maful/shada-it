<p align="center">
  <img src="./.github/shada-it.png" width="1280" title="Social Card Ruby Phosphor Icons">
</p>

# shada-it

Complete Syntax Highlighting for Markdown It with Shiki. Inspired by [markdown-it-shiki](https://github.com/antfu/markdown-it-shiki)

With `shada-it`, you can effortlessly manage your code blocks using simple comments with the `shada:{remove,add,focus}` syntax. It's compatible with various single-line comment styles, including:

- `#` for Ruby
- `<%#` for ERB Ruby
- `//` for JavaScript, TypeScript, and C++
- `/* */` for CSS

Demo: https://maful.web.id

## Install

```bash
npm i -D shada-it
```

## Usage

```js
import MarkdownIt from 'markdown-it'
import ShadaIt from 'shada-it'

const md = MarkdownIt()

md.use(ShadaIt, {
  theme: 'dracula'
})
```

Example:
~~~
```ts
interface AttrsLineOptions {
  lineNumber: boolean // shada:remove
  lineNumbers: boolean // shada:add
}
```
~~~

<img width="803" alt="image" src="https://github.com/maful/shada-it/assets/6563823/a5d011b4-2bf8-4fb8-ac57-ba718798ce13">

### Line numbers

By default, line numbers are hidden. To display them, simply include the `{lineNumbers:true}` option in your code block.

~~~
```ruby {lineNumbers:true}
class Post < ApplicationRecord
  validates :title, presence: true
  validates :body, presence: true
end
```
~~~

<img width="802" alt="image" src="https://github.com/maful/shada-it/assets/6563823/24ac0f79-32e1-4b7c-afbb-6339a7ce1104">

### Add lines

Adding lines to your code is a breeze with `shada:add`. Just use the appropriate comment syntax for your code block.

~~~
```ruby
class Post < ApplicationRecord
  has_one_attached :image # shada:add
end
```
~~~

<img width="800" alt="image" src="https://github.com/maful/shada-it/assets/6563823/49565fdf-1daf-41d6-bfea-b43bc9d4c69a">

### Remove lines

With `shada:remove`, you can easily indicate lines that should be removed from your code block using comments.

~~~
```ruby
class Post < ApplicationRecord
  has_one_attached :image # shada:remove
end
```
~~~

<img width="802" alt="image" src="https://github.com/maful/shada-it/assets/6563823/56e9833e-eff5-483a-b574-eaabb9402a35">

### Highlight lines

Make specific lines stand out by using `shada:highlight` with comment syntax tailored to your code block.

~~~
```ruby
class Post < ApplicationRecord
  has_one_attached :image # shada:highlight
end
```
~~~

<img width="801" alt="image" src="https://github.com/maful/shada-it/assets/6563823/1e705b60-2cf9-4477-8b96-f421412f3ad8">

### Focus lines

Need to draw attention to certain lines? Utilize `shada:focus` with the appropriate comment syntax for your code block.

~~~
```ruby
class Post < ApplicationRecord
  has_one_attached :image # shada:focus
end
```
~~~

Last, add these to your CSS

```css
pre code.has-focus-lines .line:not(.line-focus) {
  filter: blur(.095rem);
  opacity: .65;
  transition: filter .35s,opacity .35s
}

pre code.has-focus-lines:hover .line:not(.line-focus) {
  filter: blur();
  opacity: 1
}
```

<img width="802" alt="image" src="https://github.com/maful/shada-it/assets/6563823/e3e29ed4-4588-4538-9201-6a2ec5e002b1">

## License

The gem is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).
