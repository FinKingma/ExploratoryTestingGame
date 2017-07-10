/*eslint-disable*/
(function() {

  describe("highscore", function() {
    var client, provider

    beforeAll(function(done) {
      provider = Pact({ consumer: "ExploratoryTestingGame", provider: "HighscoreApi" })

      // required for slower Travis CI environment
      setTimeout(function () { done() }, 2000)

      // Required if run with `singleRun: false`
      provider.removeInteractions()
    })

    afterAll(function (done) {
      provider.finalize()
        .then(function () { done() }, function (err) { done.fail(err) })
    })

    describe("can retrieve top 10 results", function () {
      beforeAll(function (done) {
        provider.addInteraction({
            //state: 'Klaas wins with 100k points',
            uponReceiving: "request for top 10 results",
            withRequest: {
                method: "get",
                path: "/api/highscore"
            },
            willRespondWith: {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: [{
                    name: 'Klaas',
                    score: '100000',
                    datetime: '2017-07-10T11:50:39.276Z'
                }]
            }
        })
        .then(function () { done() }, function (err) { done.fail(err) })
      })

      it("processes the results", function(done) {
        //Run the tests
        highscore = new Highscore();
        highscore.getTop10(function(data) {
            expect(data).toBeDefined();
            expect(data[0]["name"]).toBe("Klaas");
            expect(data[0]["score"]).toBe("100000");
            done();
        });
      })

      // verify with Pact, and reset expectations
      it("successfully verifies", function(done) {
        provider.verify()
          .then(function(a) {
                done()
          }, function(e) {
            done.fail(e)
          })
      })
    })

    describe("can store a new highscore", function () {
      beforeAll(function (done) {
        provider.addInteraction({
          uponReceiving: "request to add a new highscore",
          withRequest: {
            method: "put",
            path: "/api/highscore",
            data: {
                "name": "Klaas",
                "score":"10000"
            }
          },
          willRespondWith: {
            status: 204
          }
        })
        .then(function () { done() }, function (err) { done.fail(err) })
      })

      it("should save the new highscore", function(done) {
        highscore = new Highscore();
        highscore.saveHighscore("Klaas","10000",function() {
            done();
        });
      })

      it("successfully verifies", function(done) {
        provider.verify()
          .then(function(a) {
                done()
          }, function(e) {
            done.fail(e)
          })
      })
    })
  })
})()