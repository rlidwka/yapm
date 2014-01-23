
var releases = require('..');

describe('releases(opts, fn)', function(){
  it('should respond with releases', function(done){
    releases({
      user: process.env.USER,
      pass: process.env.PASS,
      repo: 'segmentio/accounts'
    }, function(err, releases){
      if (err) return done(err);
      releases.should.not.be.empty;
      releases[0].should.have.property('name');
      releases[0].should.have.property('commit');
      done();
    });
  })
})