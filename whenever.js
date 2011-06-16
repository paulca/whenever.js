var whenever = function(element){
  var binding = {
    selector: whenever.definitions[element]
  };

  var chain =  function(){
    return {
      is: function(event){
        binding.event = event;
        return chain();
      },
      given: function(condition){
        binding.condition = condition;
        return chain();
      },
      then: function(action){
        whenever[binding.event](binding.selector, action, binding.condition)
        return chain();
      }
    }
  }
  return chain();
}

whenever.definitions = {
  add: function(object){
    for(var label in object)
    {
      this[label] = object[label]
    }
  }
}

whenever.actions = whenever.definitions
whenever.conditions = whenever.definitions

whenever.translations = {
  'clicked':'click',
  'blurred': 'focusout',
  'focussed':'focusin',
  'submitted':'submit',
  'hovered over':'focusin'
}

for(state in whenever.translations)
{
  (function(state){
    whenever[state] = function(selector, action, condition){

      var function_to_apply = function(){
        var arguments;
        if(typeof whenever.actions[action] === 'function')
        {
          return function(){
            if(typeof whenever.conditions[condition] === 'function')
            {
              if(whenever.conditions[condition].apply(this) === false)
              {
                return function(){}
              }
            }
            whenever.actions[action].apply(this);
          }
        }
        else
        {
          for(var matcher in whenever.actions)
          {
            var match;
            if(match = action.match(new RegExp(matcher)))
            {
              match.shift()
              return function(action_name, args){
                if(typeof whenever.conditions[condition] === 'function')
                {
                  return function(){
                    if(whenever.conditions[condition].apply(this) === true)
                    {
                      whenever.actions[action_name].apply(this, args)
                    }
                  }
                }
                return function(){
                  whenever.actions[action_name].apply(this, args)
                }
              }(matcher, match)
            }
            
          }
        }
      }
      
      jQuery(document).ready(function(){
        jQuery(document).delegate(
            selector,
            whenever.translations[state],
            function_to_apply()
          )
      })
    }
  })(state)
}