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
  
  // A private object to store the element, the event and the action
  var binding = {
    selector: choose_element(element)
  };
  var is, given, then;
  
  is = function(event){
    binding.event = event
    return {
      and: given,
      given: given,
      then: then
    }
  }
  
  given = function(condition){
    var function_to_apply = function(){
      if(typeof whenever.conditions[condition] === 'function')
      {
        return whenever.conditions[condition];
      }
      else
      {
        for(var matcher in whenever.conditions)
        {
          var match = condition.match(new RegExp(matcher));
          if(match)
          {
            match.shift();
            return (function(condition_name, args){
              return function(){
                return whenever.conditions[condition_name].apply(this, args);
              };
            })(matcher, match);
          }
        }
      }
    };
    
    var other_conditions = function(){ return true; };
    if(typeof binding.condition === 'function')
    {
      other_conditions = binding.condition;
    }
    binding.condition = function(){
      return function_to_apply().apply(this) && other_conditions();
    };
    return {
      and: given,
      then: then
    }
  }
  
  then = function(action){
    whenever[binding.event](binding.selector, action, binding.condition);
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

for(state in whenever.translations)
{
  (function(state){
    whenever[state] = function(selector, action, condition){
      var function_to_apply = function(){
        if(typeof whenever.actions[action] === 'function')
        {
          return function(){
            if(typeof condition === 'function')
            {
              if(condition.apply(this) === false)
              {
                return function(){};
              }
            }
            return whenever.actions[action].apply(this);
          };
        }
        else
        {
          for(var matcher in whenever.actions)
          {
            var match = action.match(new RegExp(matcher));
            if(match)
            {
              match.shift();
              return function(action_name, args){
                if(typeof condition === 'function')
                {
                  return function(){
                    if(condition.apply(this) === true)
                    {
                      return whenever.actions[action_name].apply(this, args);
                    }
                  };
                }
                return function(){
                  return whenever.actions[action_name].apply(this, args);
                };
              }(matcher, match);
            }
          }
        }
      };

      return whenever.bind_events(
        selector,
        whenever.translations[state],
        function_to_apply()
      )
    };
  })(state);
}

whenever.bind_events = function(selector, event, action){
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