var whenever = function(element){
  
      // Decide what element to bind to
      // if the element has been defined, use that
      // otherwise, use an anchor containing the text
      var choose_element = function(element){
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
      var choose_function = function(string_to_match, collection){
        var args = [];
        var function_to_call;
        if(typeof collection[string_to_match] === 'function')
        {
          function_to_call = collection[string_to_match];
        }
        else
        {
          for(var potential_match in collection)
          {
            var matches = string_to_match.match(new RegExp(potential_match))
            if(matches)
            {
              matches.shift();
              function_to_call = collection[potential_match];
              args = matches;
            }
          }
        }
        if(function_to_call)
        {
          return function(){
            return function_to_call.apply(this, args);
          }
        }
        else
        {
          throw("'" + string_to_match + "' was not found");
        }
      }
      
      // A private object to store the element, the event and the action
      var binding = {
        selector: choose_element(element),
        conditions: [],
        actions: [],
        action: undefined
      };
      var is, given, then;
      
      // store the event and return an object for chaining
      is = function(event){
        if(whenever.translations[event])
        {
          binding.event = whenever.translations[event]
        }
        else
        {
          throw(event + ' does not map to an event')
        }
        return {
          and: given,
          given: given,
          then: then
        }
      }
      
      // store a predicate along the chain
      given = function(condition){
        
        binding.conditions.push(condition)
        
        // and and then are before we've called then
        return {
          and: given,
          then: then
        }
      }
      
      // call the binding function with condition as appropriate
      then = function(action){
        var function_to_apply, translation;
        
        binding.actions.push(action)
        if(typeof binding.action === 'function')
        {
          whenever.unbind_function_to_event(
            binding.selector,
            binding.event,
            binding.action
            )
        }
    
        function_to_apply = function(){
          for(var i = 0; i<binding.conditions.length; i++)
          {
            if(choose_function(binding.conditions[i], whenever.conditions).apply(this) === false)
            {
              return false
            }
          }
          for(var i = 0; i<binding.actions.length; i++)
          {
            choose_function(binding.actions[i], whenever.actions).apply(this);
          }
        }
        
        binding.action = function_to_apply
        
        whenever.bind_function_to_event(
          binding.selector,
          binding.event,
          binding.action
        )
        
        // leave out the condition, we only want it for the first one
        return {
          and: then
        }
      }
      
      return {
        is: is
      }
    };
    
    whenever.definer = function(){}
    whenever.definer.prototype.add = function(object){
      for(var label in object)
      {
        this[label] = object[label];
      }
    };
    
    whenever.definitions  = new whenever.definer;
    whenever.actions      = new whenever.definer;
    whenever.conditions   = new whenever.definer;
    
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