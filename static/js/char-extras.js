var app = angular.module('charsheet', ['ngResource','ngSanitize']);

/*
 * Retrieve the JSON data from server
 */
app.service('rootModel', ['$rootScope','$timeout','$resource', function($rootScope,$timeout,$resource)
{
	this._resource = $resource('json', {}, {
		'get': {
			'method': 'GET',
			'transformResponse': function(data,headers){
				$timeout(function(){$rootScope.$broadcast('is_clean');}, 100);
				return angular.fromJson(data);
			}
		},
		'save': {
			'method': 'POST',
			'transformResponse': function(data,headers){
				$timeout(function(){$rootScope.$broadcast('is_clean');}, 100);
				return angular.fromJson(data);
			}
		}
	});

	this.data = this._resource.get();

	$rootScope.data = this.data;

	$rootScope.$on('is_dirty', function(){ $rootScope.dirty = true; });
	$rootScope.$on('is_clean', function(){ $rootScope.dirty = false; });
}]);

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
		'restrict': 'E',
		'replace': true,

		'template': '<div class="diceroller">'+
			'<div class="die"><span> </span></div>'+
			'<div class="die"><span> </span></div>'+
			'<div class="die"><span> </span></div>'+
			'<div class="die"><span> </span></div>'+
			'<div class="total"><span>+0</span></div>'+
		'</div>',

		'link': function($scope,elem,attrs)
		{
			elem.bind('click', function(evt){
				var dice = elem[0].querySelectorAll('.die');
				var total = 0;
				for(var i=0; i<dice.length; i++){
					var value = Math.floor(Math.random()*3 -1);
					dice[i].firstChild.innerHTML = ['\u2212',' ','+'][value+1];
					total += value;
				}
				elem[0].querySelector('.total > span').innerHTML = total>=0 ? '+'+total : total;

			});
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
			// initialize
			element.accordion({collapsible: true, active: false, heightStyle: 'content', icons: false, disabled: !scope.enabled()});

			scope.$watch(scope.enabled, function(){
				element.accordion('option', 'disabled', !scope.enabled());
			});

			// cleanup
			element.bind('$destroy', function(){
				element.accordion('destroy');
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


app.service('SharedResources', ['rootModel', function(rootModel)
{
	var self = this;
	self.shifted = false;

	// select correct list
	self.skills = function(level)
	{
		if( !rootModel.data.$resolved )
			return [];

		if( self.shifted )
			return rootModel.data.skills.shifted_lists[level];
		else
			return rootModel.data.skills.lists[level];
	};

	// convenience label function
	self.skillLabel = function(value){
		var ladder = ['Mediocre (+0)', 'Average (+1)', 'Fair (+2)', 'Good (+3)', 'Great (+4)', 'Superb (+5)', 'Fantastic (+6)', 'Epic (+7)', 'Legendary (+8)'];
		return ladder[value];
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
		if( !rootModel.data.$resolved )
			return;
		else
			return rootModel.data.totals.skills_total - self.skillPointsSpent();
	};

	self.refreshSpent = function(){
		if( !rootModel.data.$resolved )
			return;

		var total = 0;
		for( var i=0; i<rootModel.data.powers.length; i++ ){
			total += rootModel.data.powers[i].cost;
		}
		return total;
	};

	self.adjustedRefresh = function(){
		if( !rootModel.data.$resolved )
			return;

		return rootModel.data.totals.base_refresh + self.refreshSpent();
	};
}]);

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

