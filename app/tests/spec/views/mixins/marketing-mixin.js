/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const { assert } = require('chai');
  const Backbone = require('backbone');
  const BaseBroker = require('models/auth_brokers/base');
  const BaseView = require('views/base');
  const Cocktail = require('cocktail');
  const sinon = require('sinon');
  const Template = require('templates/test_template.mustache');
  const MarketingMixin = require('views/mixins/marketing-mixin');

  const AutoCreateView = BaseView.extend({
    template: Template
  });

  Cocktail.mixin(
    AutoCreateView,
    MarketingMixin({ marketingId: 'test-marketing-campaign' })
  );

  const NonAutoCreateView = BaseView.extend({
    template: Template
  });

  Cocktail.mixin(
    NonAutoCreateView,
    MarketingMixin({ autocreate: false, marketingId: 'test-marketing-campaign' })
  );

  describe('views/mixins/marketing-mixin', () => {
    let broker;

    function createView(View) {
      return new View({
        broker,
        lang: 'de',
        model: new Backbone.Model({}),
        relier: new Backbone.Model({})
      });
    }

    beforeEach(() => {
      broker = new BaseBroker({});
    });

    describe('view render', () => {
      describe('w/ autocreate:true (default)', () => {
        it('creates the marketing snippet', () => {
          const view = createView(AutoCreateView);
          sinon.stub(view, 'createMarketingSnippet').callsFake(() => {});

          return view.render()
            .then(() => {
              assert.isTrue(view.createMarketingSnippet.calledOnce);
            });
        });
      });

      describe('w/ autocreate: false', () => {
        it('does not create the marketing snippet', () => {
          const view = createView(NonAutoCreateView);
          sinon.stub(view, 'createMarketingSnippet').callsFake(() => {});

          return view.render()
            .then(() => {
              assert.isFalse(view.createMarketingSnippet.called);
            });
        });
      });
    });

    describe('createMarketingSnippet', () => {
      it('creates and tracks the marketing snippet', () => {
        const view = createView(NonAutoCreateView);
        sinon.spy(view, 'trackChildView');

        return view.createMarketingSnippet()
          .then(() => {
            assert.isTrue(view.trackChildView.calledOnce);

            // the correct language is passed through.
            const marketingSnippet = view.trackChildView.args[0][0];
            assert.equal(marketingSnippet.lang, 'de');
            assert.equal(marketingSnippet._marketingId, 'test-marketing-campaign');
          });
      });
    });
  });
});
