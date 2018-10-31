function isExist(obj){
  return obj?obj:null;
}

console.log("Test Starting");
$.ajax({
  method: "get",
  url: `https://graph.facebook.com/${GROUP_ID}/feed?fields=message,description,picture&access_token=${ACCESS_TOKEN}`,
  success: function(feeds){
    console.log(feeds);
    for(var item in feeds.data){
      if(isExist(feeds.data[item].message)){
        var text = $("<p></p>").text(feeds.data[item].message);
        $('#content').append(text);
          console.log(feeds.data[item].message);
      }
    }
  }
})
