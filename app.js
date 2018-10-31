ACCESS_TOKEN = "EAAEVd5XnjA8BAJRJgK6dsgzeiP8ZAQHqQwv2YqGiSJ9hfq9N1mmixi6PZAN66sLGXmWbbqAYKqj5hvDXDCtx7jP2uxBXWx2750BSPJK69aOcuqXSkSXsX9ZCAvNXpONqTrbLXPrZA1xbbJZBdVwsZCHWi4sfse3WH1ZBJnATWkonQZDZD"
GROUP_ID = "493931737770387"

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
