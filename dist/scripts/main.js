$(document).ready(function(){

	var $username = $("#username");
	var $password = $("#password");
	var $newUsername = $("#new-username");
	var $newPassword = $("#new-password");
	var $confirmPassword = $("#confirm-new-password");
	var $signInBtn = $("#login-btn");
	var $signUpBtn = $("#sign-up-btn");
	var firstTimeSignUp = true;

	var routeConfig = {
		routes: {
			"": "login",
			"login":"login",
			"chat/:user": "chat"
		},

		login: function(){
			console.log("im at the login screen");
			$(".page").hide();
			$("#login").show();
		},

		chat: function(user){
			$(".page").hide();
			$("#chat").show();
			$("#user-list").html(user);	
			//make get request here
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
					type: "PUT",
					url:"https://young-spire-1181.herokuapp.com/chatrooms/",
					data:{name:$newUsername.val(), password:$newPassword.val()}
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
			myRoutes.navigate("chat/"+$username.val(),{trigger: true});
		}
	}













});