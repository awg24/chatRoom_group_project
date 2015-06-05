$(document).ready(function(){

	var $username = $("#username");
	var $password = $("#password");
	var $newUsername = $("#new-username");
	var $newPassword = $("#new-password");
	var $confirmPassword = $("#confirm-new-password");
	var $signInBtn = $("#login-btn");
	var $signUpBtn = $("#sign-up-btn");
	var $message = $("#message");
	var myUsernameArray = [];
	var person;
	var theUser;

	var routeConfig = {
		routes: {
			"": "login",
			"login":"login",
			"chat/:user": "chat",
			"chat": "chat1",
			"user": "user",
			"leaderboard": "leaderboard"
		},

		login: function(){
			console.log("im at the login screen");
			$(".page").hide();
			$("#login").show();
		},

		chat: function(user){
			$(".page").hide();
			$("#chatroom").show();
			$("#user-list").html(user);	
			$("#user-info").hide();
			 person = user;
			$("#leaderboard").hide();
			$("#general-chat").show();
			//make get request here
		},
		chat1: function(){
			$(".page").hide();
			$("#chatroom").show();
			$("#user-info").hide();
			$("#leaderboard").hide();
			$("#general-chat").show();
			//make get request here
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

	//setInterval(getMessages, 500);

	function getMessages() {
		
		$.get(
			"https://young-spire-1181.herokuapp.com/messages",
			onMessagesReceived,
			'json'
		);
	}

	function onMessagesReceived(data) {
		var myHtml = render(data);
		var $messageList = $('#general-chat');
		$messageList.html(myHtml);
	}

	function getUsernames(data){
		for(var i = 0; i < data.length; i++){
			myUsernameArray.push(data[i].name);
		}
		console.log(myUsernameArray);
	}

	function render(messages) {
		var returnHtml = '';

		for(var i=0; i<messages.length; i++) {
			var currentMessage = messages[i];

			returnHtml += '<div>' + currentMessage.user_id+ ': ' + currentMessage.body + '</div>';
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
					url:"https://young-spire-1181.herokuapp.com/messages",
					data:{user_id: dataID, body: theMessage}
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
				$.ajax({
					type: "POST",
					url:"https://young-spire-1181.herokuapp.com/users",
					data:{name:$newUsername.val(), password:$newPassword.val()},
					success: function(){
						myRoutes.navigate("chat/"+$newUsername.val(), {trigger:true});
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
						myRoutes.navigate("chat/"+$username.val(),{trigger: true});
					}
			});
		}
	}
});