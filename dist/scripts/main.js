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
	var $logout = $("#logout");
	var $leaveChat = $("#leave-chat");
	var $settings = $("#settings");
	var $userSettings = $("#user-settings");
	var $saveSetting = $("#save-settings");
	var myUsernameArray = [];
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
			"chat/:user/:chatID/:chatroomName": "joinChatCall",
			"user/:userProf": "user",
			"settings":"settings",
			"leaderboard": "leaderboard"
		},

		login: function(){
			$(".page").hide();
			$("#pick-chat").hide();
			$("#login").show();
			
		},

		chat: function(user, chatID){
			person = user;
			chatroomID = chatID;		
			$(".page").hide();
			$.get("https://agile-chamber-3594.herokuapp.com/users", {name:person}, function(data){
				dataID = data.id;
			});
			$.get("https://agile-chamber-3594.herokuapp.com/chatrooms/"+chatID+"/users", function(data){
				$("#user-list").html("");
				for(var i = 0; i < data.length; i++){
					$("#user-list").append("<div><a href=#user/"+data[i].name+">"+data[i].name+"</a></div>");
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

		joinChatCall: function(user,chatID,roomName){
			$.ajax({
					type: "POST",
					url: "https://agile-chamber-3594.herokuapp.com/chatrooms/"+chatID+"/join",
					data: {user_id: dataID},
					success: function(){
						$("#nav-tabs").append("<li><a href='#chat/"+person+"/"+chatID+"'>"+roomName+"</a></li>");
						myRoutes.navigate("chat/"+person+"/"+chatID, {trigger: true});
					}
				});
		},

		pickChat: function(){
			$(".page").hide();
			$("#pick-chat").show();
			$("#panel-create ol").html("");
			$.get("https://agile-chamber-3594.herokuapp.com/chatrooms/", function(data){
				for(var i = 0; i < data.length; i++){
					if(data[i].name !== "General Chat"){
							var chatName = data[i].name;
							var chatID = data[i].id
						$("#panel-create ol").append("<li><a href=#chat/"+person+"/"+data[i].id+"/"+chatName+">"+data[i].name+"</a></li><br>");
					}
				}

			});
		},

		user: function(userProf){
			user = person;
			var userHtml = "";
			$(".page").hide();
			$("#chatroom").show();
			$("#general-chat").hide();
			$("#leaderboard").hide();
			$("#user-info").show();
			$.get("https://agile-chamber-3594.herokuapp.com/users", {name: userProf}, function(data){
				var personID = data.id;
				var userName = data.name;
				var messageIdArray = data.message_ids.split("+");
				$.get("https://agile-chamber-3594.herokuapp.com/messages", function(gettingMessages){
					userHtml += "<div>Chat History for "+userName+"</div>";
					for(var i = 0; i < gettingMessages.length; i++){
						var mes = gettingMessages[i];
						if(mes.user_id === personID){
							userHtml += "<div>"+mes.body+"</div>"
						}
					}
					$("#user-info").html(userHtml);
					myRoutes.navigate("#user", {trigger: true});
				});
			});

		},

		leaderboard: function(){
			user = person;
			$(".page").hide();
			$("#chatroom").show();
			$("#general-chat").hide();
			$("#user-info").hide();
			$("#leaderboard").show();
			displayLeaders();
		},

		settings: function(){
			$(".page").hide();
			$userSettings.show();
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
		$.post("https://agile-chamber-3594.herokuapp.com/chatrooms/", {name: $("#new-chat-name").val()}, function(data){
			$("#panel-create ol").append("<li><a href=#chat/"+person+"/"+data.id+">"+$("#new-chat-name").val()+"</a></li>");
				$.ajax({
					type: "POST",
					url: "https://agile-chamber-3594.herokuapp.com/chatrooms/"+data.id+"/join",
					data: {user_id: dataID},
					success: function(){
						$("#nav-tabs").append("<li><a href=#chat/"+person+"/"+data.id+">"+$("#new-chat-name").val()+"</a></li>");
					}
				});
			});
	});

	$message.on("submit", function(event){
		event.preventDefault();
		var messageID = null;
		var userID = null;
		var theMessage = $("#message-area").val();
		soundsCommands(theMessage);
		$("#message-area").val("");
		$.get("https://agile-chamber-3594.herokuapp.com/users", {name:person}, function(data){
			var dataID = data.id;

			$.ajax({
					type: "POST",
					url:"https://agile-chamber-3594.herokuapp.com/messages/",
					data:{user_id: dataID, body: theMessage, chatroom_id: chatroomID},
					success: function(){
				
					}
				});
			
		},"json");	
	});

	$logout.on("click", function(){
		$.post("https://agile-chamber-3594.herokuapp.com/users/logout",{user_id: dataID}, function(){
				myRoutes.navigate("login", {trigger:true});
				location.reload();
			});
	});

	$leaveChat.on("click", function(){
		var html = "";
		if(chatroomID !== "1"){
			$.post("https://agile-chamber-3594.herokuapp.com/chatrooms/"+chatroomID+"/leave",{user_id: dataID} ,function(things){
					$('#nav-tabs li:last').remove();
					myRoutes.navigate("chat/"+person+"/1", {trigger:true});

				}
			);
		}
	});

	$settings.on("click", function(){
		myRoutes.navigate("settings",{trigger: true});
	});

	$saveSetting.on("click", function(){
		var contentHistory = $('input[name=content-history]:checked').val();
		var recentUsers = $('input[name=recent-users]:checked').val();
		var profanity = $('input[name=profanity]:checked').val();
		if(profanity === undefined){
			profanity = "censor:off";
		} else {
			profanity = "censor:on"
		}
		
		$.post("https://agile-chamber-3594.herokuapp.com/users/"+dataID+"/settings/add",{settings: contentHistory},function(){
			$.post("https://agile-chamber-3594.herokuapp.com/users/"+dataID+"/settings/add",{settings: recentUsers},function(){
				$.post("https://agile-chamber-3594.herokuapp.com/users/"+dataID+"/settings/add",{settings: profanity},function(){
					myRoutes.navigate("chat/"+person+"/1",{trigger:true});
				})
			});
		});	
	});

	setInterval(function() {getMessages(chatroomID)}, 500);

	function updateUserList(){
		
	}

	function getMessages(IDs) {
		if(IDs){
			var objDiv = $("#general-chat");
				objDiv.scrollTo("max");
			$.get(
				"https://agile-chamber-3594.herokuapp.com/chatrooms/"+IDs+"/contents",{user_id: dataID},
				onMessagesReceived,
				'json'
			);
		}
	}

	function onMessagesReceived(data) {
		var myHtml = render(data);
		var $messageList = $("#general-chat");
		$messageList.html(myHtml);
		$('.comment').emoticonize({animated: false, delay: 0});
	}

	function getUsernames(data){
		for(var i = 0; i < data.length; i++){
			myUsernameArray.push(data[i].name);
		}
		myUsernameArray.reverse();	
	}

	function render(messages) {
		var returnHtml = '';
		
		for(var i=0; i<messages.length; i++) {
			var checkForHttps = messages[i].body.substring(0,8);
			var checkforPic = messages[i].body.substring(messages[i].body.length-4, messages[i].body.length);
			var checkforCom = messages[i].body.substring(messages[i].body.length-4, messages[i].body.length);
			var checkForHttp = messages[i].body.substring(0,7);
			var checkForWww = messages[i].body.substring(0,4);

			if(messages[i].name === "chatbot"){
				returnHtml += '<div class=comment>['+messages[i].timestamp+"] <span id=chatbot>"+messages[i].name + "</span>: " + messages[i].body + "</div>";
			} else {
				if(checkforPic === ".jpg" || checkforPic === ".png"){
					if(checkForHttps === "https://" || checkForHttp === "http://" || checkForWww === "www."){
						if(checkForWww === "www."){
							returnHtml += "<div class=comment>["+messages[i].timestamp+"] <span>"+messages[i].name + "</span>: " +"<br><a href=http://"+messages[i].body +">"+messages[i].body +"</a><br><img src=http://"+messages[i].body+"></div>";
						} else {
							returnHtml += "<div class=comment>["+messages[i].timestamp+"] <span>"+messages[i].name + "</span>: " +"<br><a href="+messages[i].body +">"+messages[i].body +"</a><br><img src="+messages[i].body+"></div>";
						}
					} else {
						returnHtml += '<div class=comment>['+messages[i].timestamp+"] <span>"+messages[i].name + "</span>: " + messages[i].body + '</div>';
					}
				} else if(checkForHttps === "https://" || checkForHttp === "http://" || checkForWww === "www." && checkforCom === ".com"){
					if(checkForWww === "www."){
						returnHtml += "<div class=comment>["+messages[i].timestamp+"] <span>"+messages[i].name + "</span>: " +"<a href='http://"+messages[i].body+"'>"+messages[i].body +"</a></div>";
					} else {
						returnHtml += "<div class=comment>["+messages[i].timestamp+"] <span>"+messages[i].name + "</span>: " +"<a href='"+messages[i].body+"'>"+messages[i].body +"</a></div>";
					}
				} else {
					returnHtml += '<div class=comment>['+messages[i].timestamp+"] <span>"+messages[i].name + "</span>: " + messages[i].body + "</div>";
				}
			}
		}
		return returnHtml;
	}

	function displayLeaders(){
		var returnHtml = "";

		$.get("https://agile-chamber-3594.herokuapp.com/users/leaderboard",{user_id: dataID},function(data){
			for(var i = 0; i < data["recent_users"].length; i++){
				var recent = data["recent_users"][i];
				returnHtml += "<div>Recent active users: "+recent+"</div>"
			}
			for(var i = 0; i < data["leaderboard"].length; i++){
				var leaders = data["leaderboard"][i];
				returnHtml += "<div>Total messages sent for "+leaders.user_name+": "+ leaders.message_count+"</div>"
			}
			
			var $messageList = $("#leaderboard");
			$messageList.html(returnHtml);
		});

		$.get("https://agile-chamber-3594.herokuapp.com/chatrooms/active",function(data){
			for(var i = 0; i < data.length; i++){
				returnHtml += '<div> Total chat messages in '+data[i].name+": "+data[i].message_count + '</div>';
			}
			
			var $messageList = $("#leaderboard");
			$messageList.html(returnHtml);
		});
	}

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
					url:"https://agile-chamber-3594.herokuapp.com/users",
					data:{name:$newUsername.val(), password:$newPassword.val()},
					success: function(data){
						myRoutes.navigate("chat/"+$newUsername.val()+"/"+"1", {trigger:true});
					}
				});
			}
	}

	function validateLogin(){
		var loggingInUser;
		if($username.val() === "" || $password.val() === ""){
			$("#login-fields").addClass("has-error");
			$("#error-login").addClass("give-error");
			$("#error-login").html("*Fields must not be blank");
			myRoutes.navigate("login",{trigger: true});
		} else {
			$("#login-fields").removeClass("has-error");
			$("#error-login").removeClass("give-error");
			$("#error-login").html("");
			$.get("https://agile-chamber-3594.herokuapp.com/users", {name:$username.val()} ,function(data){
					loggingInUser = data.id;
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
						$.ajax({
							type: "POST",
							url:"https://agile-chamber-3594.herokuapp.com/chatrooms/1/join",
							data:{user_id:loggingInUser},
							success: function(data){
								$.get("https://agile-chamber-3594.herokuapp.com/users/"+loggingInUser+"/chatrooms", function(data){
									for(var i = 0; i < data.length; i++){
										if(data[i].name !== "General Chat"){
											$("#nav-tabs").append("<li><a href='#chat/"+person+"/"+data[i].id+"'>"+data[i].name+"</a></li>");
										}
									}
								});
								myRoutes.navigate("chat/"+$username.val()+"/1", {trigger:true});
							}
						});
					}
			});
		}
	}

	function soundsCommands(cmd){
		switch(cmd){
			case "@burp": 
					var snd = new Audio("sounds/burp.wav");
					snd.play();
			break;
			case "@ohhh": 
					var snd = new Audio("sounds/ohhh.wav");
					snd.play();
			break;
			case "@kiss": 
					var snd = new Audio("sounds/kiss.wav");
					snd.play();
			break;
			case "@whistle": 
					var snd = new Audio("sounds/whistle.wav");
					snd.play();
			break;
			case "@sneeze": 
					var snd = new Audio("sounds/sneeze.wav");
					snd.play();
			break;
			case "@laugh": 
					var snd = new Audio("sounds/laugh.wav");
					snd.play();
			break;
			case "@gandalf": 
					var snd = new Audio("sounds/gandalf.wav");
					snd.play();
			break;
			default:
			break;
		}
	}
});