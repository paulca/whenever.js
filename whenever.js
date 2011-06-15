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
      then: function(action){
        whenever[binding.event](binding.selector, action)
        return chain();
      }
    }
  }
  return chain();
}

whenever.translations = {
  'clicked':'click',
  'submitted':'submit'
}

for(state in whenever.translations)
{
  (function(state){
    whenever[state] = function(selector, action){
      jQuery(function(){
        jQuery(document).delegate(
            selector,
            whenever.translations[state],
            whenever.actions[action]
          )
      })
    }
  })(state)
}