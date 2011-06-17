# Whenever.js #

Whenever is a javascript library that provides a simple domain specific language on top of jQuery to specify your application's behavior using a syntax that reads like English.

Whenever helps you to organise your javascripts in a clean and tidy way, and keeps your implementation logic separate from your behavioral logic.

## Example ##

For example, take the following:

```javascript
whenever('Click Me!').is('clicked').then('Change the text to "Clicked!"')
```

By itself, this does nothing, but it very clearly describes what will happen.

It's easy to hook up. First, `'Click Me!'` should map to an element:

```javascript
whenever.definitions.add({
  'Click Me!': 'a.click-me'
})
```

`clicked` is automatically mapped to the `click` event.

Finally, `'Change the text to "Clicked!"'` should be hooked up to a function:

```javascript
whenever.actions.add({
  'Change the text to "Clicked!"': function(){
    $(this).text("Clicked!")
  }
})
```

Or you can do this with a RegExp for re-use:

```javascript
whenever.actions.add({
  'Change the text to "([^"]*)"'': function(value){
    $(this).text(value)
  }
})
```

That's it!

## Conditions ##

Goodbye to nested `if` statements! Add conditionals:

```javascript
whenever('Click Me!')
  .is   ('clicked')
  .given('one and one make two')
  .then ('Change the text to "Clicked!"')
```

And implement:

```javascript
whenever.conditions.add({
  'one and one make two': function(){
    return 1+1 === 2
  }
})
```

Usefully, the jQuery object is passed along:

```javascript
whenever('Click Me!')
  .is   ('clicked')
  .given('the text of this is "Something"')
  .then ('Change the text to "Clicked!"')
```

And implement:

```javascript
whenever.conditions.add({
  'the text of this is "Something"': function(){
    return $(this).text() === 'Something'
  }
})
```

## Chaining ##

You can chain conditions and actions:

```javascript
whenever('Click Me!')
  .is   ('clicked')
  .given('the text of this is "Something"')
    .and('Some other condition')
    .and('Another condition')
  .then ('Change the text to "Clicked!"')
    .and('Do something else')
    .and('Do another thing')
```

That's it!

## Supported events ##

At the moment, the following actions are supported:

    'clicked':      'click',
    'blurred':      'focusout',
    'focussed':     'focusin',
    'submitted':    'submit',
    'hovered over': 'mouseenter'

## Installation ##

Whenever.js currently depends on `jQuery`. After including jQuery, just add the `whenever.js` script to your project:

```html
    <script type="text/javascript" src="jquery.js"></script>
    <script type="text/javascript" src="whenever.js"></script>
```

You might prefer to place your behavior, definitions and actions in separate files, or all in the one file.