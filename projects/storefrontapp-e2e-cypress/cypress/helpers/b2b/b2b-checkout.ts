import { addCheapProductToCart, waitForPage } from '../checkout-flow';
import { poNumber, POWERTOOLS_BASESITE, products } from './b2b';

export function addB2bProductToCartAndCheckout() {
  cy.visit(`${POWERTOOLS_BASESITE}/en/USD/product/${products[0].code}`);
  cy.get('cx-product-intro').within(() => {
    cy.get('.code').should('contain', products[0].code);
  });
  cy.get('cx-breadcrumb').within(() => {
    cy.get('h1').should('contain', products[0].name);
  });

  addCheapProductToCart(products[0]);

  const paymentTypePage = waitForPage(
    '/checkout/payment-type',
    'getPaymentType'
  );
  cy.getByText(/proceed to checkout/i).click();
  cy.wait(`@${paymentTypePage}`).its('status').should('eq', 200);
}

export function enterPONumber() {
  cy.get('cx-payment-type .cx-payment-type-container').should(
    'contain',
    'Payment method'
  );
  cy.get('cx-payment-type').within(() => {
    cy.get('.form-control').clear().type(poNumber);
  });
}

export function selectAccountPayment() {
  cy.get('cx-payment-type').within(() => {
    cy.getByText('Account').click({ force: true });
  });

  const shippingPage = waitForPage(
    '/checkout/shipping-address',
    'getShippingPage'
  );
  cy.get('button.btn-primary').click({ force: true });
  cy.wait(`@${shippingPage}`).its('status').should('eq', 200);
}

export function selectCreditCardPayment() {
  cy.get('cx-payment-type').within(() => {
    cy.getByText('Credit Card').click({ force: true });
  });

  const shippingPage = waitForPage(
    '/checkout/shipping-address',
    'getShippingPage'
  );
  cy.get('button.btn-primary').click({ force: true });
  cy.wait(`@${shippingPage}`).its('status').should('eq', 200);
}

export function selectAccountShippingAddress() {
  cy.get('.cx-checkout-title').should('contain', 'Shipping Address');
  cy.get('cx-order-summary .cx-summary-partials .cx-summary-row')
    .first()
    .find('.cx-summary-amount')
    .should('not.be.empty');

  cy.server();

  cy.route(
    'GET',
    `${Cypress.env('OCC_PREFIX')}/${Cypress.env(
      'BASE_SITE'
    )}/users/current/carts/*`
  ).as('getCart');
  cy.get('cx-card').within(() => {
    cy.get('.cx-card-label-bold').should('not.be.empty');
    cy.get('.cx-card-actions .cx-card-link').click({ force: true });
  });

  cy.wait('@getCart');
  cy.get('cx-card .card-header').should('contain', 'Selected');

  const deliveryPage = waitForPage(
    '/checkout/delivery-mode',
    'getDeliveryPage'
  );
  cy.get('button.btn-primary').click({ force: true });
  cy.wait(`@${deliveryPage}`).its('status').should('eq', 200);
}
