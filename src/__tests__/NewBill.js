/**
 * @jest-environment jsdom
 */

import mockStore from '../__mocks__/store';
import '@testing-library/jest-dom';
import { screen, fireEvent, waitFor } from '@testing-library/dom';
import NewBillUI from '../views/NewBillUI.js';
import NewBill from '../containers/NewBill.js';
import BillsUI from '../views/BillsUI.js';
import { localStorageMock } from '../__mocks__/localStorage.js';
import { ROUTES, ROUTES_PATH } from '../constants/routes.js';
import router from '../app/Router.js';
jest.mock('../app/store', () => mockStore);

describe('Given I am connected as an employee', () => {
	describe('When I am on NewBill Page', () => {
		test('Then ...', () => {
			const html = NewBillUI();
			document.body.innerHTML = html;
			//to-do write assertion
		});

		test('Then the title sould be "Envoyer une note de frais"', () => {
			document.body.innerHTML = NewBillUI({ data: NewBill });
			const titleElement = screen.getByTestId('content-title');
			expect(titleElement).toBeTruthy();
			expect(titleElement.textContent).toBe(' Envoyer une note de frais ');
		});

		test('Then there is a form with id form-new-bill', () => {
			document.body.innerHTML = NewBillUI({ data: NewBill });
			const formElement = screen.getByTestId('form-new-bill');
			expect(formElement).toBeTruthy();
		});

		test('Then there is a label and a select for expense type', () => {
			document.body.innerHTML = NewBillUI();
			const label = screen.getByText('Type de dépense');
			const select = screen.getByTestId('expense-type');

			expect(label).toBeInTheDocument();
			expect(select).toBeInTheDocument();
			expect(label).toHaveClass('bold-label');
			expect(select).toHaveAttribute('required');
		});

		test('Then the select has the correct options', () => {
			document.body.innerHTML = NewBillUI();
			const select = screen.getByTestId('expense-type');
			const options = Array.from(select.options).map(
				option => option.textContent
			);

			expect(options).toEqual([
				'Transports',
				'Restaurants et bars',
				'Hôtel et logement',
				'Services en ligne',
				'IT et électronique',
				'Equipement et matériel',
				'Fournitures de bureau',
			]);
		});

		test('Then the select has the correct attributes', () => {
			document.body.innerHTML = NewBillUI();
			const select = screen.getByTestId('expense-type');

			expect(select).toHaveAttribute('required');
			expect(select).toHaveClass('form-control', 'blue-border');
		});
	});

	describe('When I am on NewBill Page', () => {
		let newBill;

		beforeEach(() => {
			document.body.innerHTML = NewBillUI();
			newBill = new NewBill({
				document,
				onNavigate: jest.fn(),
				store: {},
				localStorage: window.localStorage,
			});
		});
		test('Then the new bill form should be displayed', () => {
			const html = NewBillUI();
			document.body.innerHTML = html;
			expect(screen.getByTestId('form-new-bill')).toBeTruthy();
		});
	});

	describe('When I click on the button -Envoyer- with an empty form', () => {
		test('Then the form should still be rendered', async () => {
			Object.defineProperty(window, 'localStorage', {
				value: localStorageMock,
			});
			window.localStorage.setItem(
				'user',
				JSON.stringify({
					type: 'Employee',
				})
			);
			document.body.innerHTML = NewBillUI({});
			const onNavigate = pathname => {
				document.body.innerHTML = ROUTES({ pathname });
			};

			const newBill = new NewBill({
				document,
				onNavigate,
				store: mockStore,
				localStorage: window.localStorage,
			});

			const btnSend = document.getElementById('btn-send-bill');
			const handleClickSend = jest.fn(newBill.handleFormValidation);
			btnSend.addEventListener('click', handleClickSend);
			fireEvent.click(btnSend);
			expect(screen.getByTestId('form-new-bill')).toBeTruthy;
		});
	});

	describe('When an invalid file is uploaded', () => {
		test('Then an alert should be displayed', async () => {
			console.log('Test starting');
			document.body.innerHTML = NewBillUI();
			console.log('DOM after NewBillUI:', document.body.innerHTML);

			const newBill = new NewBill({
				document,
				onNavigate: jest.fn(),
				store: mockStore,
				localStorage: window.localStorage,
			});
			console.log('NewBill instance created');

			const inputFile = screen.getByTestId('file');
			console.log('Input file element:', inputFile);

			// Mock the alert function
			const alertMock = jest
				.spyOn(window, 'alert')
				.mockImplementation(() => {});

			fireEvent.change(inputFile, {
				target: {
					files: [new File([''], 'document.pdf', { type: 'application/pdf' })],
				},
			});
			console.log('File change event fired');

			// Verify that the alert was called
			expect(alertMock).toHaveBeenCalledTimes(1);
			expect(alertMock).toHaveBeenCalledWith('Extensions non permises');

			// Restore the original alert function
			alertMock.mockRestore();
		});
	});

	describe('When I submit a new bill', () => {
		test('Then the bill should be created', async () => {
			jest.spyOn(mockStore, 'bills');
			Object.defineProperty(window, 'localStorage', {
				value: localStorageMock,
			});
			window.localStorage.setItem(
				'user',
				JSON.stringify({ type: 'Employee', email: 'a@a' })
			);

			document.body.innerHTML = NewBillUI();

			const newBill = new NewBill({
				document,
				onNavigate: jest.fn(),
				store: mockStore,
				localStorage: window.localStorage,
			});

			const inputData = {
				type: 'Hôtel et logement',
				name: 'Séminaire billed',
				date: '2004-04-04',
				amount: 400,
				vat: '80',
				pct: 20,
				commentary: 'séminaire billed',
				file: new File([''], 'test.jpg', { type: 'image/jpeg' }),
			};

			// je remplis le foirm
			screen.getByTestId('expense-type').value = inputData.type;
			screen.getByTestId('expense-name').value = inputData.name;
			screen.getByTestId('datepicker').value = inputData.date;
			screen.getByTestId('amount').value = inputData.amount;
			screen.getByTestId('vat').value = inputData.vat;
			screen.getByTestId('pct').value = inputData.pct;
			screen.getByTestId('commentary').value = inputData.commentary;

			const fileInput = screen.getByTestId('file');
			Object.defineProperty(fileInput, 'files', { value: [inputData.file] });

			const form = screen.getByTestId('form-new-bill');
			const handleSubmit = jest.fn(e => newBill.handleSubmit(e));
			form.addEventListener('submit', handleSubmit);
			fireEvent.submit(form);

			expect(handleSubmit).toHaveBeenCalled();
			expect(mockStore.bills).toHaveBeenCalled();
		});
	});

	// POST NEWBILL ET ERREURS
	describe('Given I am a user connected as Employee', () => {
		beforeEach(() => {
			jest.spyOn(mockStore, 'bills');

			localStorage.setItem(
				'user',
				JSON.stringify({ type: 'Employee', email: 'a@a' })
			);
			const root = document.createElement('div');
			root.setAttribute('id', 'root');
			document.body.append(root);
			router();
		});

		describe('When I navigate to newBill', () => {
			// Nouvelle facture
			test('promise from mock API POST returns object bills with correct values', async () => {
				window.onNavigate(ROUTES_PATH.NewBill);

				const bills = await mockStore.bills().create();
				expect(bills.key).toBe('1234');
				expect(bills.fileUrl).toBe('https://localhost:3456/images/test.jpg');
			});

			// Erreur 404
			test('Then, fetches bills from an API and fails with 404 message error', async () => {
				window.onNavigate(ROUTES_PATH.NewBill);

				mockStore.bills.mockImplementationOnce(() => {
					return {
						create: () => {
							return Promise.reject(new Error('Erreur 404'));
						},
					};
				});

				await new Promise(process.nextTick);
				document.body.innerHTML = BillsUI({ error: 'Erreur 404' });
				const message = screen.getByText('Erreur 404');
				expect(message).toBeTruthy();
			});

			// Erreur 500
			test('Then, fetches messages from an API and fails with 500 message error', async () => {
				mockStore.bills.mockImplementationOnce(() => {
					return {
						create: () => {
							return Promise.reject(new Error('Erreur 500'));
						},
						list: () => {
							return Promise.resolve([]);
						},
					};
				});
				await new Promise(process.nextTick);
				document.body.innerHTML = BillsUI({ error: 'Erreur 500' });
				const message = screen.getByText('Erreur 500');
				expect(message).toBeTruthy();
			});
		});
	});
});
// describe('Constructor', () => {
// 	let newBill;
// 	let mockDocument;
// 	let mockOnNavigate;
// 	let mockStore;
// 	let mockLocalStorage;

// 	beforeEach(() => {
// 		mockDocument = {
// 			querySelector: jest.fn().mockReturnValue({
// 				addEventListener: jest.fn(),
// 			}),
// 		};
// 		mockOnNavigate = jest.fn();
// 		mockStore = {};
// 		mockLocalStorage = {};

// 		newBill = new NewBill({
// 			document: mockDocument,
// 			onNavigate: mockOnNavigate,
// 			store: mockStore,
// 			localStorage: mockLocalStorage,
// 		});
// 	});

// 	test('Then It should add listeners in form and input file', () => {
// 		expect(mockDocument.querySelector).toHaveBeenCalledWith(
// 			'form[data-testid="form-new-bill"]'
// 		);
// 		expect(mockDocument.querySelector).toHaveBeenCalledWith(
// 			'input[data-testid="file"]'
// 		);

// 		const mockForm = mockDocument.querySelector(
// 			'form[data-testid="form-new-bill"]'
// 		);
// 		const mockFileInput = mockDocument.querySelector(
// 			'input[data-testid="file"]'
// 		);

// 		expect(mockForm.addEventListener).toHaveBeenCalledWith(
// 			'submit',
// 			expect.any(Function)
// 		);
// 		expect(mockFileInput.addEventListener).toHaveBeenCalledWith(
// 			'change',
// 			expect.any(Function)
// 		);
// 	});

// 	test('Then It should initialize Null', () => {
// 		expect(newBill.fileUrl).toBeNull();
// 		expect(newBill.fileName).toBeNull();
// 		expect(newBill.billId).toBeNull();
// 	});
// });
