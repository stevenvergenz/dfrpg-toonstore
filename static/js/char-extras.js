var app = angular.module('charsheet', ['ngSanitize','ui.sortable']);

/*
 * Retrieve the JSON data from server
 */
app.service('rootModel', ['$rootScope','$timeout','$http', function($rootScope,$timeout,$http)
{
	$rootScope.clientStrings = clientStrings;

	this.data = charModel;
	$rootScope.data = charModel;
	$rootScope.data.$save = function()
	{
		$http.post('json', $rootScope.data)
			.success(function(data,status){
				console.log('Character data saved');
				$rootScope.$broadcast('is_clean');
			})
			.error(function(data,status){
				console.log('Save failed!');
				alert('Character data save failed!: '+data);
			});
	};
	$timeout(function(){$rootScope.$broadcast('is_clean');}, 100);

	$rootScope.$on('is_dirty', function(){ $rootScope.dirty = true; });
	$rootScope.$on('is_clean', function(){ $rootScope.dirty = false; });
	$rootScope.$watch('dirty', function(newVal,oldVal)
	{
		function confirmUnload(e){
			e.returnValue = clientStrings.unsavedWarning;
			return e.returnValue;
		}

		if( newVal === true ){
			console.log('Page listener added');
			window.onbeforeunload = confirmUnload;
		}
		else {
			console.log('Page listener removed');
			window.onbeforeunload = null;
		}
	});
}]);

app.directive('dgyCondense', ['$timeout', function($timeout)
{
	var pageElement = document.querySelector('.page');

	return {
		restrict: 'A',
		link: function(scope,element,attr)
		{
			$timeout(function checkHeight()
			{
				console.log('Checking condensation:', pageElement.scrollHeight);
				if( pageElement.scrollHeight > 960 && !element.hasClass('condensed5') )
				{
					if( element.hasClass('condensed0') ){
						element.removeClass('condensed0').addClass('condensed1');
					}
					else if( element.hasClass('condensed1') ){
						element.removeClass('condensed1').addClass('condensed2');
					}
					else if( element.hasClass('condensed2') ){
						element.removeClass('condensed2').addClass('condensed3');
					}
					else if( element.hasClass('condensed3') ){
						element.removeClass('condensed3').addClass('condensed4');
					}
					else if( element.hasClass('condensed4') ){
						element.removeClass('condensed4').addClass('condensed5');
					}
					$timeout(checkHeight);
				}
				else {
					window.print();
				}
			});
		}
	};
}]);

app.directive('dgyNotifyCollection', function()
{
	return {
		'restrict': 'A',
		'link': function(scope,element,attr){
			if( attr.ngModel ){
				scope.$watchCollection(attr.ngModel, function(newVal,oldVal){
					scope.$emit('is_dirty');
				});
			}
		}
	};
});

app.directive('dgyNotify', function()
{
	return {
		'restrict': 'A',
		'link': function(scope,element,attr){
			if( attr.ngModel ){
				scope.$watch(attr.ngModel, function(newVal,oldVal){
					scope.$emit('is_dirty');
				});
			}
		}
	};
});

app.directive('resizingtextarea', function()
{
	return {
		'restrict': 'E',
		'template': '<textarea></textarea>',
		'replace': true,
		'link': function($scope,elem,attrs)
		{
			elem.bind('keydown', function(evt){
				var element = evt.target;
				if( evt.which === 13 || evt.which === 27 ){
					evt.preventDefault();
					element.blur();
				}
			});

			elem.bind('keyup', 'blur', function(evt)
			{
				var element = evt.target;
				$(element).height(0);
				var height = $(element)[0].scrollHeight;
				$(element).height(height);
			});

			elem.bind('click', function(evt){
				if(evt.preventDefault)
					evt.preventDefault();
				var elem = $(evt.target);
				if( !elem.attr('readonly') )
					elem.focus().select();
			});

			setTimeout(function()
			{
				var element = elem;
				$(element).height(0);
				var height = $(element)[0].scrollHeight;
				$(element).height(height);
			}, 100);
		}
	};
});

app.directive('diceroller', function()
{
	return {
		'restrict': 'C',
		'link': function($scope,elem,attrs)
		{
			// randomize the dice
			elem.bind('click', function(evt){
				if(evt.stopPropagation)
					evt.stopPropagation();

				// animate shake
				elem[0].className += ' shakenbake';
				function animationEnd(evt){
					elem[0].className = elem[0].className.replace(/\bshakenbake/g, '');
				}
				elem[0].addEventListener('webkitAnimationEnd', animationEnd);
				elem[0].addEventListener('MSAnimationEnd', animationEnd);
				elem[0].addEventListener('animationend', animationEnd);

				// randomize each die
				var dice = elem[0].querySelectorAll('.die');
				var total = 0;
				for(var i=0; i<dice.length; i++){
					var value = Math.floor(Math.random()*3)-1;
					dice[i].firstChild.innerHTML = ['\u2212','\u2022','+'][value+1];
					total += value;
				}
				// update the total field
				elem[0].querySelector('.total > span').innerHTML = total>=0 ? '+'+total : total;

			});

			// prevent the symbols from being selected
			var parts = elem[0].querySelectorAll('*');
			for(var i=0; i<parts.length; i++){
				parts[i].onmousedown = function(evt){
					if(evt.preventDefault)
						evt.preventDefault();
				};
			}
		}
	};
});


/*
  Custom directive to enable drag/dropping
 */

app.directive('dgyDraggable', function()
{
	return {
		'restrict': 'A',
		'scope': {
			'enabled': '&dgyDraggable'
		},
		'link': function(scope,element,attr)
		{
			// initialize
			element.draggable({
				'revert': true,
				'disabled': !scope.enabled()
			});

			// update draggable property based on enabled
			scope.$watch(scope.enabled, function(){
				element.draggable('option', 'disabled', !scope.enabled());
			});

			// cleanup
			element.bind('$destroy', function(){
				element.draggable('destroy');
			});
		}
	};
});

app.directive('dgyDroppable', function()
{
	return {
		'restrict': 'A',
		'scope': {
			'enabled': '&dgyDroppable',
			'callback': '&dgyDrop'
		},
		'link': function(scope,element,attr)
		{
			// initialize
			element.droppable({
				'disabled': !scope.enabled(),
				'hoverClass': 'hoverDropTarget',
				'drop': scope.callback()
			});

			scope.$watch(scope.enabled, function(){
				element.droppable('option', 'disabled', !scope.enabled());
			});

			// cleanup
			element.bind('$destroy', function(){
				element.droppable('destroy');
			});
		}
	};
});


app.directive('dgyAccordion', function()
{	
	return {
		'restrict': 'AC',
		'scope': {
			'enabled': '&dgyAccordion'
		},
		'link': function(scope,element,attr)
		{
			var initialized = false;
			scope.$watch(scope.enabled, function(newVal,oldVal)
			{
				if(newVal){
					initialized = true;
					element.accordion({collapsible: true, active: false, heightStyle: 'content', icons: false});
				}
				else if(initialized){
					element.accordion('destroy');
					initialized = false;
				}
			});

			// cleanup
			element.bind('$destroy', function()
			{
				if(initialized){
					element.accordion('destroy');
					initialized = false;
				}
			});
		}
	};
});



app.filter('conseqSort', function()
{
	function sort(left,right){
		var severity = ['Mild', 'Moderate', 'Severe', 'Extreme'];
		if( severity.indexOf(left.severity) < severity.indexOf(right.severity) ){
			return -1;
		}
		else if( severity.indexOf(left.severity) > severity.indexOf(right.severity) ){
			return 1;
		}
		else {
			if( left.mode < right.mode ){
				return -1;
			}
			else if( left.mode > right.mode ){
				return 1;
			}
			else {
				return 0;
			}
		}
	}

	return function(list)
	{
		if(list){
			list.sort(sort);
		}
		return list;
	};
});

app.filter('mdToHtml', ['$sce', '$sanitize', function($sce, $sanitize){
	return function(md){
		if(md)
			return $sce.trustAsHtml($sanitize(markdown.toHTML(md)));
	};
	
}]);

app.filter('formatRefresh', [function(){
	return function(x){
		if(x>0)
			return '+'+x;
		else if(x==0)
			return '-'+x;
		else
			return x;
	};
}]);

app.service('SharedResources', ['rootModel', function(rootModel)
{
	var self = this;
	self.shifted = false;

	// select correct list
	self.skills = function(level)
	{
		if( self.shifted )
			return rootModel.data.skills.shifted_lists[level];
		else
			return rootModel.data.skills.lists[level];
	};

	// convenience label function
	self.skillLabel = function(value){
		return clientStrings.skillLadder[value];
	};

	self.skillPointsSpent = function(){
		var spent = 0;
		for(var i=0; i<8; i++){
			spent += i * self.skills(i).length;
		}
		return spent;
	};

	// calculate skill points available
	self.skillPointsAvailable = function(){
		return rootModel.data.totals.skills_total - self.skillPointsSpent();
	};

	self.refreshSpent = function(){
		var total = 0;
		for( var i=0; i<rootModel.data.powers.length; i++ ){
			total += rootModel.data.powers[i].cost;
		}
		return total;
	};

	self.adjustedRefresh = function(){
		return rootModel.data.totals.base_refresh + self.refreshSpent();
	};
}]);

app.directive('dgySrc', function()
{
	return {
		restrict: 'A',
		link: function(scope,element,attr)
		{
			var fallback = '/static/img/no-avatar.png';

			element.bind('error', function(evt){
				if( attr['src'] !== fallback )
					element.attr('src', fallback);
			});

			element.attr('src', attr.dgySrc);
		}
	};
});


// special global-scope function to upload avatar
function uploadAvatar()
{
	var formData = new FormData($('div#avatar form')[0]);
	$.ajax({
		'url': 'avatar',
		'type': 'POST',
		'contentType': false,
		'processData': false,
		'cache': false,
		'data': formData,

		'success': function(data,status,xhr){
			$('#avatar > #imgContainer > img')[0].src = 'avatar';
		},
		'error': function(xhr,status,err){
			console.log(err, status);
		}
	});
};

