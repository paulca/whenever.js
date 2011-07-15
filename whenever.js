var whenever = function (element) {
  "use strict";
  var choose_element, choose_function, binding, is, given, then;

  // Decide what element to bind to
  // if the element has been defined, use that
  // otherwise, use an anchor containing the text
   choose_element = function (element) {
    if(typeof whenever.definitions[element] === 'string')
    {
      return whenever.definitions[element];
    }
    else if(typeof whenever.definitions[element] === 'object')
    {
      return whenever.definitions[element];
    }
    else
    {
      return 'a:contains("' + element + '")';
    }
  };
  
  // choose a function from a collection of functions
  // returns the function to call as the first argument
  // and the arguments to call it with as the second
  choose_function = function (string_to_match, collection) {
    var args, function_to_call, potential_match, matches;
    args = [];
    if(typeof collection[string_to_match] === 'function')
    {
      function_to_call = collection[string_to_match];
    }
    else
    {
      for(potential_match in collection)
      {
        if(collection.hasOwnProperty(potential_match))
        {
          matches = string_to_match.match(new RegExp(potential_match));
          if(matches)
          {
            matches.shift();
            function_to_call = collection[potential_match];
            args = matches;
          }
        }
      }
    }
    if(typeof function_to_call === 'function')
    {
      return function () {
        return function_to_call.apply(this, args);
      };
    }
    else
    {
      throw("'" + string_to_match + "' was not found");
    }
  };
  
  // A private object to store the element, the event and the action
  binding = {
    selector: choose_element(element),
    conditions: [],
    actions: [],
    action: undefined
  };
  
  // store the event and return an object for chaining
  is = function (event) {
    if(whenever.translations[event])
    {
      binding.event = whenever.translations[event];
    }
    else
    {
      throw(event + ' does not map to an event');
    }
    return {
      and: given,
      given: given,
      then: then
    };
  };
  
  // store a predicate along the chain
  given = function (condition) {
    
    binding.conditions.push(condition);
    
    // and and then are before we've called then
    return {
      and: given,
      then: then
    };
  };
  
  // call the binding function with condition as appropriate
  then = function (action) {
    var function_to_apply;
    
    // add the action to the chain of actions
    binding.actions.push(action);
    
    // unbind the previous 'then' or 'and'
    if(typeof binding.action === 'function'
        && binding.event !== 'ready'
        && binding.event !== 'load')
    {
      whenever.unbind_function_to_event(
        binding.selector,
        binding.event,
        binding.action
        );
    }

    // create a function that runs the condition before running the actions
    function_to_apply = function () {
      var i, out;
      for(i = 0; i<binding.conditions.length; i = i+1)
      {
        if(choose_function (binding.conditions[i], whenever.conditions)
                           .apply(this) === false)
        {
          return false;
        }
      }
      if(binding.event !== 'ready' && binding.event !== 'load')
      {
        for(i = 0; i<binding.actions.length; i=i+1)
        {
          out = choose_function (binding.actions[i], whenever.actions)
                                .apply(this);
        }
      }
      else
      {
        out = choose_function (action, whenever.actions).apply(this);
      }

      // return the result of the last function in the chain
      return out;
    };
    
    // save the function to check for later
    binding.action = function_to_apply;
    
    // bind it!
    whenever.bind_function_to_event(
      binding.selector,
      binding.event,
      binding.action
    );
    
    // only and left
    return {
      and: then
    };
  };
  
  // is follows whenever
  return {
    is: is
  };
};

// extend object so we can build up definitions more than once
whenever.definer = function () {
  "use strict";
};
whenever.definer.prototype.add = function (object) {
  "use strict";
  var label;
  for(label in object)
  {
    if(object.hasOwnProperty(label))
    {
      this[label] = object[label];
    }
  }
};

whenever.definitions  = new whenever.definer();
whenever.actions      = new whenever.definer();
whenever.conditions   = new whenever.definer();

whenever.translations = {
  'blurred': 'blur',
  'clicked':'click',
  'focussed':'focus',
  'hovered over':'mouseenter',
  'hovered out of':'mouseout',
  'loaded': 'load',
  'ready': 'ready',
  'submitted':'submit',
  'changed': 'change'
};

whenever.unbind_function_to_event = function (selector, event, action) {
  "use strict";
  return jQuery(document).ready(function () {
    jQuery(document).undelegate(selector, event, action);
  });
};

whenever.bind_function_to_event = function (selector, event, action) {
  "use strict";
  return jQuery(document).ready(function () {
    if(event === 'ready' || event === 'load')
    {
      action.apply(selector);
    }
    else
    {
      return jQuery(document).delegate(selector, event, action);
    }
  });
};