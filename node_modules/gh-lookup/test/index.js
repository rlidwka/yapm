
var releases = require('..');
var assert = require('assert');

describe('releases(opts, fn)', function(){
  it('should respond with releases', function(done){
    releases({
      token: process.env.TOKEN,
      repo: 'segmentio/accounts',
      version: '1.x'
    }, function(err, release){
      if (err) return done(err);
      assert(release);
      assert(release.name);
      assert(release.commit);
      done();
    });
  })
})