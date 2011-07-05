# Whenever.js #

Whenever is a javascript library that lets you write your application logic in a format that reads like English. You define your definitions by using a simple expression chain, then hook it up in the background using jQuery, zepto, Prototype, mootools, dojo et al. jQuery support ships out of the box.

Whenever helps you to organise your javascripts in a clean and tidy way, and keeps your implementation logic separate from your behavioral logic.

NB: This is not a testing library. cucumber provided the inspiration for the syntax and separation of specification/implementation, but you should be able to use whenever.js to write actual apps.

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
  'Change the text to "([^"]*)"': function(value){
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

or, again, you can use a RegExp:

```javascript
whenever.conditions.add({
  'the text of this is "([^"]*)"': function(value){
    return $(this).text() === value
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

```javascript
'blurred': 'blur',
'clicked':'click',
'focussed':'focus',
'hovered over':'mouseenter',
'hovered out of':'mouseout',
'loaded': 'load',
'ready': 'ready',
'submitted':'submit',
'changed': 'change'
```

## Installation ##

Whenever.js needs a DOM library in order to bind actions to events. Out of the box, it comes with support for `jQuery`, but as long as you have an underlying library that supports binding events to elements, you can probably use it.

If your DOM library supports jQuery syntax (eg. Zepto), you can just replace jQuery with that globally. eg. with Zepto:

```javascript
var jQuery = $;
```

Alternatively, you can implement your own `whenever.bind_function_to_event` and `whenever.unbind_function_to_event` function. Here's what they look like for jQuery:

```javascript
whenever.unbind_function_to_event = function(selector, event, action){
  return jQuery(document).ready(function(){
    jQuery(document).undelegate(selector, event, action);
  })
}

whenever.bind_function_to_event = function(selector, event, action){
  return jQuery(document).ready(function(){
    if(event === 'ready' || event === 'load')
    {
      action.apply(selector)
    }
    else
    {
      return jQuery(document).delegate(selector, event, action);
    }
  });
}
```

or for Prototype:

```javascript
whenever.unbind_function_to_event = function(selector, event, action){
  document.stopObserving(selector, event, action)
}

whenever.bind_function_to_event = function(selector, event, action){
  if(event === 'ready' || event === 'load')
  {
    document.observe('dom:loaded', function(){
      action.apply(document)
    })
  }
  else
  {
    document.on(event, selector, function(_event, element){
      action.apply(element)
    })
  }
}
```

After including your DOM library of choice, just add the `whenever.js` script to your project, eg. for jQuery:

```html
<script type="text/javascript" src="jquery.js"></script>
<script type="text/javascript" src="whenever.js"></script>
```

You might prefer to place your behavior, definitions and actions in separate files, or all in the one file.

## A Note on Expressiveness ##

Whenever is an attempt to help writing expressive javascript. There are two motivations here:

- Code that can be read quickly without trudging through logic
- Code that clearly expresses the intent of what the programmer wants to achieve

Consider the example above, which is a bit misleading:

```javascript
whenever('Click Me!').is('clicked').then('Change the text to "Clicked!"')
```

This is a trite example, which serves to explain the basic workings of Whenever, but it's not necessarily a great example, since it doesn't encapsulate very much, and doesn't explain much more than the equivalent jQuery would:

```javascript
$('a#click-me').click(function(){ $(this).html('Clicked!') })
```

It does remove a lot of the cruft, but it might be argued that it doesn't _add_ a lot of meaning vs. the straight jQuery.

Riffing on this a little:

```javascript
whenever('Click Me!').is('clicked').then('show the user that they clicked')
```

This is (probably) better, but maybe a bit abstract. It does get away from the danger of writing code in English, which completely misses the point. Consider:

```javascript
whenever('Click Me!').is('clicked').then('add the "display" class')
```

Basically, when it gets to this, it's almost identical to the jQuery, and tells us nothing about why we would want to add the display class, or what that means.

```javascript
$('a#click-me').click(function(){ $(this).addClass('display') })
```

It inherently shows what the code _does_ but not what the overall intent was.

The point is, whenever is an exercise in writing clean code and not necessarily writing code in English for its own sake. Like everything, it's a fine balance.