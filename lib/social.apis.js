(function() {

  var URL = 'https://ec2-176-32-66-172.ap-northeast-1.compute.amazonaws.com';

  var noop = function() {
  };

  var apis = {};
  var authenticate = function(d) {
    var status = d[0], response = d[1], name = d[2];
    var service = apis[name];

    if(status === 200) {
      service['oauth'] = response['oauth'] || {};
      return true;
    }
    return false;
  };
  window.addEventListener('message', function(evt) {
    if(URL.indexOf(evt.origin) < 0)
      return;
    var d = JSON.parse(evt.data), id = d.shift();
    var cache = hash[id];
    if(!cache)
      return;
    var success = cache[0], fail = cache[1];

    clear(id);

    var service = apis[d[2]];
    authenticate(d) ? success.call(service): fail.call(service);
  });
  var hash = {};

  var clear = function(id) {
    var cache = hash[id] || [], sub = cache[2] || {};
    delete hash[id], clearInterval(cache[3]), clearTimeout(cache[4]);
    sub.closed === false && sub.close();
  };

  var signin = function(service, success, fail) {
    var sub = window.open(URL + '/login/' + service, '_blank');
    var id = '' + +new Date;
    var interval = setInterval(function() {
      sub.closed ? clear(id): sub.postMessage(JSON.stringify({
        id: id,
        origin: location.origin
      }), URL);
    }, apis['INTERVAL']);
    var timeout = setTimeout(function() {
      if(sub.closed === false)
        clear(id), fail.call(apis[service]);
    }, apis['TIMEOUT']);
    hash[id] = [success, fail, sub, interval, timeout];
  };

  var services = ['github', 'twitter', 'google', 'facebook', 'dropbox',
    'linkedin', 'yahoo.com', 'yahoo.co.jp', 'bitbucket', 'tumblr', 'microsoft',
    'instagram', 'synquery'];
  services.forEach(function(name) {
    var service = apis[name] = {};
    service['signin'] = function(success, fail) {
      success = 'function' === typeof success ? success: noop;
      fail = 'function' === typeof fail ? fail: noop;
      return signin(name, success, fail);
    };
  });
  apis['INTERVAL'] = 1000;
  apis['TIMEOUT'] = 60000;

  this['SocialAPIs'] = apis;

}).call();
