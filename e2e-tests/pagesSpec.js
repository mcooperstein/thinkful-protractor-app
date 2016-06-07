process.env.NODE_ENV = process.env.NODE_ENV || 'TEST';
var db = require('../api/db.js');

describe("Test Pages", function () {

    beforeEach(function () {
        db.serialize(function () {
            db.run('DELETE FROM urls');
        });
    });

    var ROOT = "http://localhost:7777/#";

    function createUrlEntry(title, url) {
        //direct browser to the endpoint for adding new entries
        browser.get(ROOT + "/new");
        //find element by its model attribute value & enter title
        element(by.model('formCtrl.form.title')).sendKeys(title);
        //do the same w/ URL
        element(by.model('formCtrl.form.url')).sendKeys(url);
        //after entering values, find & click submit button
        return element(by.css('input[type=submit]')).click();
    }

    it('should have no listings on the index page and show a special message', function () {
        //build base URL and check that there are 0 entries as expected
        browser.get(ROOT + "/");
        expect(element.all(by.css('.url-listing')).count()).toBe(0);
        //check to see that the fallback element is displaying
        expect(element.all(by.css('.empty-url-listing')).count()).toBe(1);
        //check to make sure browser url matches expected end point
        expect(element(by.css('.empty-url-listing')).getText()).toMatch(/no URL listings/);
    });

    it('should create a new URL listing', function () {
        //create a random title for URL
        var customTitle = 'title-' + Math.random();
        //create a random URL to be shortened
        var customUrl = 'http://my-new-website.com/' + Math.random();
        //call createUrlEntry function and pass in customTitle and customUrl
        createUrlEntry(customTitle, customUrl);
        //get url of the browser and assert that it matches the url listings endpoint
        expect(browser.getLocationAbsUrl()).toMatch(/#\/urls/);
        //check to be sure there is now one url listing, verify the shortened url has been created as expected
        expect(element.all(by.css('.url-listing')).count()).toBe(1);
        //check to see if customTitle variable is part of the entry
        expect(element(by.css('.url-listing .listing-title')).getText()).toContain(customTitle);
        //check to see if customUrl variable is part of the entry
        expect(element(by.css('.url-listing .listing-url')).getText()).toContain(customUrl);
        //check that fallback element is not displaying
        expect(element.all(by.css('.empty-url-listing')).count()).toBe(0);

    });


    it('should search based off of the URL', function () {
        //add 3 dummy urls for testing
        createUrlEntry("url one", "http://url-one.com");
        createUrlEntry("url two", "http://url-two.com");
        createUrlEntry("url three", "http://url-three.com");
        //build base url & check to see that there are 3 entries as expected
        browser.get(ROOT + "/");
        expect(element.all(by.css('.url-listing')).count()).toBe(3);
        //build url for single entry & check to see there is 1 entry as expected
        browser.get(ROOT + "/?q=one");
        expect(element.all(by.css('.url-listing')).count()).toBe(1);
        //build url for no entries & check to see there are 0 entries as expected
        browser.get(ROOT + "/?q=x");
        expect(element.all(by.css('.url-listing')).count()).toBe(0);
    });

    it('should edit created url', function () {
        //assign title string to var
        var originalTitle = "url one";
        //assign url string to var
        var originalUrl = "http://url-one.com";
        //call createUrlEntry function to pass in our vars as form inputs
        createUrlEntry(originalTitle, originalUrl);
        //direct browser to this endpoint
        browser.get(ROOT + "/");
        //select element by css class name & check text for string contents of originalTitle var
        expect(element(by.css('.url-listing .listing-title')).getText()).toContain(originalTitle);
        //click on edit button
        element(by.linkText('Edit')).click();
        //check to make sure browser url matches expected end point
        expect(browser.getLocationAbsUrl()).toMatch(/#\/edit\/[0-9]{1}/);
        //assign string value to new dummy title var
        var editedTitle = 'edited';
        //clear out the original title from the form
        element(by.model('formCtrl.form.title')).clear();
        //send in the string value of the new editedTitle var
        element(by.model('formCtrl.form.title')).sendKeys(editedTitle);
        //click on submit button
        element(by.css('input[type=submit]')).click();
        //direct broswer back to original url
        browser.get(ROOT + "/");
        //select the same element again by css class & check text for string value of editedTitle var
        expect(element(by.css('.url-listing .listing-title')).getText()).toContain(editedTitle);
        //check to make sure the string value of originalTitle var are gone
        expect(element(by.css('.url-listing .listing-title')).getText()).not.toContain(originalTitle);

    });

    it('should edit created url', function () {
        //create url title and address for testing
        createUrlEntry("url one", "http://url-one.com");
        //direct the browser to the base url
        browser.get(ROOT + "/");
        //check to see that there is only one element w/ css class of 'url-listing'
        expect(element.all(by.css('.url-listing')).count()).toBe(1);
        //set breakpoint for testing
        browser.debugger();
        //grab the edit button by its css class and click it
        element(by.css('.btn-primary')).click();
        //direct the browser back to the base url
        browser.get(ROOT + "/");
        //check to see that there are no elements w/ css class 'url-listing'
        //proving that it was edited as expected
        expect(element.all(by.css('.url-listing')).count()).toBe(0);

    });

    it('should delete an existing URL listing', function () {
        //create 2 url titles and addresses for testing
        createUrlEntry("url one", "http://url-one.com");
        createUrlEntry("url two", "http://url-two.com");
        //direct the browser to the base url
        browser.get(ROOT + "/");
        //grab the delete button by its css class and click it
        element(by.css('.btn-danger')).click();
        //direct the browser back to the base url
        browser.get(ROOT + "/");
        //check to see if there is only one element left w/ css class of 'url-listing'
        //proving that one listing was deleted as expected
        expect(element.all(by.css('.url-listing')).count()).toBe(1);
    });

});
