$(document).ready(function(){

	var $username = $("#username");
	var $password = $("#password");
	var $newUsername = $("#new-username");
	var $newPassword = $("#new-password");
	var $confirmPassword = $("#confirm-new-password");
	var $signInBtn = $("#login-btn");
	var $signUpBtn = $("#sign-up-btn");
	var $message = $("#message");
	var $createNewChat = $("#create-chat");
	var myUsernameArray = [];
	var increment = 1;
	var go = false;
	var person;
	var theUser;
	var chatroomID;
	var dataID;

	var routeConfig = {
		routes: {
			"": "login",
			"login":"login",
			"pick-chat": "pickChat",
			"chat/:user/:chatID": "chat",
			"user": "user",
			"leaderboard": "leaderboard"
		},

		login: function(){
			console.log("im at the login screen");
			$(".page").hide();
			$("#pick-chat").hide();
			$("#login").show();
			
		},

		chat: function(user, chatID){
			go = true;
			person = user;
			chatroomID = chatID;
			$(".page").hide();
			$.get("https://young-spire-1181.herokuapp.com/users", {name:person}, function(data){
				dataID = data.id;
			});
			$.get("https://young-spire-1181.herokuapp.com/chatrooms/"+chatID+"/users", function(data){
				$("#user-list").html("");
				for(var i = 0; i < data.length; i++){
					$("#user-list").append("<div>"+data[i]+"</div>");
				}		
			});	
			$("#user-info").hide();
			$("#pick-chat").hide();
			$("#leaderboard").hide();
			$("#login").hide();
			$("#general-chat").show();
			$("#chatroom").show();
			
			//make get request here
		},

		pickChat: function(){
			$(".page").hide();
			$("#pick-chat").show();
			$("#panel-create ol").html("");
			$.get("https://young-spire-1181.herokuapp.com/chatrooms/", function(data){
				for(var i = 1; i < data.length; i++){
					if(data[i].name !== "General Chat"){
						$("#panel-create ol").append("<li><a href=#chat/"+person+"/"+data[i].id+">"+data[i].name+"</a></li><br>");

						$("#chat-"+data[i].id).on("click", function(){
							var index =	$(this).attr("id").split("-")[1]
							$("#nav-tabs").append("<li><a href='#chat/"+person+"/"+index+"'>"+$(this).html()+"</a></li>");
							myRoutes.navigate("chat/"+person+"/"+index, {trigger:true});
						});
					}
				}

			});
		},

		user: function(){
			console.log("user info");
			console.log(person);
			user = person;
			$(".page").hide();
			$("#chatroom").show();
			$("#general-chat").hide();
			$("#leaderboard").hide();
			$("#user-info").show();

		},

		leaderboard: function(){
			console.log("leaderboard");
			user = person;
			$(".page").hide();
			$("#chatroom").show();
			$("#general-chat").hide();
			$("#user-info").hide();
			$("#leaderboard").show();
		}
	};

	var app = Backbone.Router.extend(routeConfig);
	var myRoutes = new app();

	Backbone.history.start();

	$signInBtn.on("click", function(){
		validateLogin();
	});

	$signUpBtn.on("click", function(){
		validateNewSignUp();
	});

	$createNewChat.on("click", function(){
		console.log(person)
		$.get("https://young-spire-1181.herokuapp.com/chatrooms/", function(data){
			console.log(data);
			var dataNum = data[data.length-1];
			var newChatID = dataNum.id + 1;
			$("#panel-create ol").append("<li><a href=#chat/"+person+"/"+newChatID+">"+$("#new-chat-name").val()+"</a></li>");
			$.post("https://young-spire-1181.herokuapp.com/chatrooms/", {name: $("#new-chat-name").val()}, function(){
				$("#nav-tabs").append("<li><a href=#chat/"+person+"/"+newChatID+">"+$("#new-chat-name").val()+"</a></li>");
			});
			console.log(dataID);
			console.log("run");
				$.ajax({
					type: "PUT",
					url: "https://young-spire-1181.herokuapp.com/chatrooms/"+newChatID+"/join",
					data: {user_id: dataID},
					success: function(){
						console.log("i worked");
					}
				});
				console.log("ran");
		});
	});

		setInterval( function() { getMessages(chatroomID) }, 500 );

	function getMessages(IDs) {
		if(IDs){
			var objDiv = $("#general-chat");
				objDiv.scrollTo("max");
			$.get(
				"https://young-spire-1181.herokuapp.com/chatrooms/"+IDs+"/contents",
				onMessagesReceived,
				'json'
			);
		}
	}

	function onMessagesReceived(data) {
		var myHtml = render(data);
		var $messageList = $("#general-chat");
		$messageList.html(myHtml);
	}

	function getUsernames(data){
		for(var i = 0; i < data.length; i++){
			myUsernameArray.push(data[i].name);
		}
		myUsernameArray.reverse();
		
	}

	function render(messages) {
		var returnHtml = '';
		console.log(messages);
		for(var i=0; i<messages.length; i++) {

			returnHtml += '<div>' +messages[i].name + ': ' + messages[i].body + '</div>';
		}
		return returnHtml;
	}

	$message.on("submit", function(event){
		event.preventDefault();
		var messageID = null;
		var userID = null;
		var theMessage = $("#message-area").val();
		$("#message-area").val("");
		$.get("https://young-spire-1181.herokuapp.com/users", {name:person}, function(data){
			var dataID = data.id;

			$.ajax({
					type: "POST",
					url:"https://young-spire-1181.herokuapp.com/messages/",
					data:{user_id: dataID, body: theMessage, chatroom_id: chatroomID},
					success: function(){
						
					}
				});
			
		},"json");
		
	});

	function validateNewSignUp(){
		if($newUsername.val() === "" || $newPassword.val() === "" || $confirmPassword.val() === ""){

			$("#blank").addClass("has-error");
			$("#label-error").addClass("give-error");
			$("#label-error").html("*Fields must not be blank");
			myRoutes.navigate("login",{trigger: true});
		} else if($newPassword.val() !== $confirmPassword.val()){

				$("#blank").removeClass("has-error");
				$("#label-error").removeClass("give-error");

				$("#password-not-match").addClass("has-error");
				$("#label-error").addClass("give-error");
				$("#label-error").html("*Passwords do not match");

				myRoutes.navigate("login",{trigger: true});
			} else {
				$("#nav-tabs").prepend("<li><a href='#chat/"+$newUsername.val()+"/1'>General Chat</a></li>");
				$.ajax({
					type: "POST",
					url:"https://young-spire-1181.herokuapp.com/users",
					data:{name:$newUsername.val(), password:$newPassword.val()},
					success: function(data){
						console.log(data.id);
						myRoutes.navigate("chat/"+$newUsername.val()+"/"+"1", {trigger:true});
						go = true;
					}
				});
			}
	}

	function validateLogin(){

		if($username.val() === "" || $password.val() === ""){
			$("#login-fields").addClass("has-error");
			$("#error-login").addClass("give-error");
			$("#error-login").html("*Fields must not be blank");
			myRoutes.navigate("login",{trigger: true});
		} else {
			$("#login-fields").removeClass("has-error");
			$("#error-login").removeClass("give-error");
			$("#error-login").html("");
			$.get("https://young-spire-1181.herokuapp.com/users", {name:$username.val()} ,function(data){
					if(data.length === 0){
						$("#login-fields").addClass("has-error");
						$("#error-login").addClass("give-error");
						$("#error-login").html("*Username does not exist");
					} else if (data.password !== $password.val()){
						$("#login-fields").addClass("has-error");
						$("#error-login").addClass("give-error");
						$("#error-login").html("*Password is incorrect");
					} else {
						person = $username.val();
						$("#nav-tabs").prepend("<li><a href='#chat/"+person+"/1'>General Chat</a></li>");
						$.get("https://young-spire-1181.herokuapp.com/chatrooms/", function(data){
							for(var i = 1; i < data.length; i++){
								if(data[i].name !== "General Chat"){
									$("#nav-tabs").append("<li><a href='#chat/"+person+"/"+data[i].id+"'>"+data[i].name+"</a></li>");
								}
							}
						});
						go = true;
						myRoutes.navigate("chat/"+person+"/"+"1",{trigger: true});
					}
			});
		}
	}
});