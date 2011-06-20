var whenever = function(element){
  
  var choose_element = function(element){
    if(typeof whenever.definitions[element] === 'string')
    {
      return whenever.definitions[element];
    }
    else
    {
      return 'a:contains("' + element + '")';
    }
  };
  
  var binding = {
    selector: choose_element(element)
  };

  var chain =  function(){
    return {
      is: function(event){
        binding.event = event;
        return chain();
      },
      given: function(condition){
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
        
        var other_conditions = function(){ return true;};
        if(typeof binding.condition === 'function')
        {
          other_conditions = binding.condition;
        }
        binding.condition = function(){
          return function_to_apply().apply(this) && other_conditions();
        };
        var out = chain();
        out.and = out.given;
        return out;
      },
      then: function(action){
        whenever[binding.event](binding.selector, action, binding.condition);
        var out = chain();
        out.and = out.then;
        return out;
      }
    };
  };
  return chain();
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
  'clicked':'click',
  'blurred': 'blur',
  'focussed':'focus',
  'submitted':'submit',
  'hovered over':'mouseenter',
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
    return jQuery(document).delegate(selector, event, action);
  });
}