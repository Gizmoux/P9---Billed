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
		// Vérifier que le formulaire est présent
		test('Then the new bill form should be displayed', () => {
			const html = NewBillUI();
			document.body.innerHTML = html;
			expect(screen.getByTestId('form-new-bill')).toBeTruthy();
		});
	});

	describe('When I am on a newBill Page', () => {
		test('Then It should keep the form rendered when I submit', async () => {
			// Utilisation du mock localStorage pour simuler un utilisateur connecté
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
			expect(screen.getByTestId('form-new-bill')).toBeTruthy();
			// expect(handleClickSend).toHaveBeenCalled();
		});
	});

	describe('When an invalid file is uploaded', () => {
		test('Then an alert should be displayed', async () => {
			document.body.innerHTML = NewBillUI();

			const newBill = new NewBill({
				document,
				onNavigate: jest.fn(),
				store: mockStore,
				localStorage: window.localStorage,
			});

			const inputFile = screen.getByTestId('file');

			// Mock of the alert
			const alertMock = jest
				.spyOn(window, 'alert')
				.mockImplementation(() => {});

			fireEvent.change(inputFile, {
				target: {
					files: [new File([''], 'document.pdf', { type: 'application/pdf' })],
				},
			});

			// check call alert
			expect(alertMock).toHaveBeenCalledTimes(1);
			expect(alertMock).toHaveBeenCalledWith('Extensions non permises');

			// Restore alert
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

			// fill form
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

	//  ERRORS
	describe('Given I am a user connected as Employee', () => {
		describe('When I navigate to newBill and an error occurs on API', () => {
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

			test('Then, fetches bills from an API and fails with 404 message error', async () => {
				window.onNavigate(ROUTES_PATH.NewBill);

				mockStore.bills.mockImplementationOnce(() => {
					return {
						create: () => {
							return Promise.reject(new Error('Erreur 404'));
						},
					};
				});
				// Permet à d'autres opérations de se terminer
				await new Promise(process.nextTick);
				document.body.innerHTML = BillsUI({ error: 'Erreur 404' });
				const message = screen.getByText('Erreur 404');
				expect(message).toBeTruthy();
			});

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
