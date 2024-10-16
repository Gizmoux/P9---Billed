/**
 * @jest-environment jsdom
 */

import { screen, fireEvent, waitFor } from '@testing-library/dom';
import NewBillUI from '../views/NewBillUI.js';
import NewBill from '../containers/NewBill.js';
import '@testing-library/jest-dom';
import mockStore from '../__mocks__/store';
import { localStorageMock } from '../__mocks__/localStorage.js';
import { ROUTES, ROUTES_PATH } from '../constants/routes';
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
	describe('Constructor', () => {
		let newBill;
		let mockDocument;
		let mockOnNavigate;
		let mockStore;
		let mockLocalStorage;

		beforeEach(() => {
			mockDocument = {
				querySelector: jest.fn().mockReturnValue({
					addEventListener: jest.fn(),
				}),
			};
			mockOnNavigate = jest.fn();
			mockStore = {};
			mockLocalStorage = {};

			newBill = new NewBill({
				document: mockDocument,
				onNavigate: mockOnNavigate,
				store: mockStore,
				localStorage: mockLocalStorage,
			});
		});

		test('Then It should add listeners in form and input file', () => {
			expect(mockDocument.querySelector).toHaveBeenCalledWith(
				'form[data-testid="form-new-bill"]'
			);
			expect(mockDocument.querySelector).toHaveBeenCalledWith(
				'input[data-testid="file"]'
			);

			const mockForm = mockDocument.querySelector(
				'form[data-testid="form-new-bill"]'
			);
			const mockFileInput = mockDocument.querySelector(
				'input[data-testid="file"]'
			);

			expect(mockForm.addEventListener).toHaveBeenCalledWith(
				'submit',
				expect.any(Function)
			);
			expect(mockFileInput.addEventListener).toHaveBeenCalledWith(
				'change',
				expect.any(Function)
			);
		});

		test('Then It should initialize Null', () => {
			expect(newBill.fileUrl).toBeNull();
			expect(newBill.fileName).toBeNull();
			expect(newBill.billId).toBeNull();
		});
	});

	// Tests de handleChangeFile
	describe('handleChangeFile', () => {
		// Tester avec un fichier d'extension valide (.jpg, .jpeg, .png)
		// Tester avec un fichier d'extension invalide
		// Vérifier que FormData est correctement créé et rempli
		// Vérifier que l'appel à l'API (this.store.bills().create) est effectué correctement
		// Vérifier que billId, fileUrl et fileName sont mis à jour après un appel API réussi
		// Vérifier que le message d'erreur s'affiche pour les extensions non valides
	});

	describe('handleSubmit', () => {
		// Tests de handleSubmit
		// Vérifier que e.preventDefault() est appelé
		// Vérifier que les données du formulaire sont correctement extraites
		// Vérifier que updateBill est appelé avec les bonnes données
		// Vérifier que onNavigate est appelé avec le bon chemin après la soumission
	});

	jest.mock('../app/store', () => mockStore);

	describe('Given I am connected as an employee', () => {
		describe('When I am on NewBill Page', () => {
			test('Then the new bill form should be displayed', () => {
				const html = NewBillUI();
				document.body.innerHTML = html;
				expect(screen.getByTestId('form-new-bill')).toBeTruthy();
			});

			describe('When I submit a new bill', () => {
				test('Then a new bill should be created', async () => {
					const html = NewBillUI();
					document.body.innerHTML = html;

					const onNavigate = jest.fn();

					Object.defineProperty(window, 'localStorage', {
						value: localStorageMock,
					});
					window.localStorage.setItem(
						'user',
						JSON.stringify({ type: 'Employee', email: 'employee@test.com' })
					);

					const newBill = new NewBill({
						document,
						onNavigate,
						store: mockStore,
						localStorage: window.localStorage,
					});

					// Mock handleSubmit to avoid navigation
					const handleSubmitSpy = jest.spyOn(newBill, 'handleSubmit');
					handleSubmitSpy.mockImplementation(jest.fn(e => e.preventDefault()));

					// Mock create method
					const createSpy = jest.spyOn(mockStore.bills(), 'create');
					createSpy.mockResolvedValue({
						fileUrl: 'http://localhost:3456/images/test.jpg',
						key: '1234',
					});

					// Fill the form
					const inputData = {
						type: 'Transports',
						name: 'Test bill',
						date: '2023-05-15',
						amount: '100',
						vat: '20',
						pct: '10',
						commentary: 'Test comment',
						file: new File(['test'], 'test.jpg', { type: 'image/jpeg' }),
					};

					screen.getByTestId('expense-type').value = inputData.type;
					screen.getByTestId('expense-name').value = inputData.name;
					screen.getByTestId('datepicker').value = inputData.date;
					screen.getByTestId('amount').value = inputData.amount;
					screen.getByTestId('vat').value = inputData.vat;
					screen.getByTestId('pct').value = inputData.pct;
					screen.getByTestId('commentary').value = inputData.commentary;

					const fileInput = screen.getByTestId('file');
					Object.defineProperty(fileInput, 'files', {
						value: [inputData.file],
					});
					fireEvent.change(fileInput);

					const form = screen.getByTestId('form-new-bill');
					fireEvent.submit(form);

					await waitFor(() => {
						expect(createSpy).toHaveBeenCalled();
						expect(handleSubmitSpy).toHaveBeenCalled();
					});

					expect(newBill.billId).toBe('1234');
					expect(newBill.fileUrl).toBe('http://localhost:3456/images/test.jpg');
				});
			});

			describe('When an error occurs on API', () => {
				test('Then it should log an error', async () => {
					const html = NewBillUI();
					document.body.innerHTML = html;

					const onNavigate = jest.fn();

					Object.defineProperty(window, 'localStorage', {
						value: localStorageMock,
					});
					window.localStorage.setItem(
						'user',
						JSON.stringify({ type: 'Employee', email: 'employee@test.com' })
					);

					const errorStore = {
						bills: () => ({
							create: jest.fn().mockRejectedValue(new Error('Erreur 404')),
						}),
					};

					const newBill = new NewBill({
						document,
						onNavigate,
						store: errorStore,
						localStorage: window.localStorage,
					});

					// Mock handleSubmit to avoid navigation
					const handleSubmitSpy = jest.spyOn(newBill, 'handleSubmit');
					handleSubmitSpy.mockImplementation(jest.fn(e => e.preventDefault()));

					const consoleSpy = jest.spyOn(console, 'error');

					// Fill and submit the form
					const form = screen.getByTestId('form-new-bill');
					fireEvent.submit(form);

					await waitFor(() => {
						expect(consoleSpy).toHaveBeenCalledWith(new Error('Erreur 404'));
					});
				});
			});
		});
	});
});
