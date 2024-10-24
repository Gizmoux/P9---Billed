/**
 * @jest-environment jsdom
 */

import mockStore from '../__mocks__/store';
import { screen, waitFor, fireEvent, userEvent } from '@testing-library/dom';
import BillsUI from '../views/BillsUI.js';
import { bills } from '../fixtures/bills.js';
import { ROUTES_PATH, ROUTES } from '../constants/routes.js';
import { localStorageMock } from '../__mocks__/localStorage.js';
import '@testing-library/jest-dom';
import Bills from '../containers/Bills.js';
import router from '../app/Router';

jest.mock('../app/store', () => mockStore);

describe('Given I am connected as an employee', () => {
	describe('When I am on Bills Page', () => {
		test('Then bill icon in vertical layout should be highlighted', async () => {
			Object.defineProperty(window, 'localStorage', {
				value: localStorageMock,
			});
			window.localStorage.setItem(
				'user',
				JSON.stringify({
					type: 'Employee',
				})
			);
			const root = document.createElement('div');
			root.setAttribute('id', 'root');
			document.body.append(root);
			router();
			window.onNavigate(ROUTES_PATH.Bills);
			await waitFor(() => {
				return screen.getByTestId('icon-window');
			});
			const windowIcon = screen.getByTestId('icon-window');
			expect(windowIcon).toBeTruthy();
		});
		test('Then bills should be ordered from earliest to latest', () => {
			document.body.innerHTML = BillsUI({ data: bills });
			const dates = screen
				.getAllByText(
					/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
				)
				.map(a => a.innerHTML);
			const antiChrono = (a, b) => (a < b ? 1 : -1);
			const datesSorted = [...dates].sort(antiChrono);
			expect(dates).toEqual(datesSorted);
		});
		test('Then the title sould be "Mes notes de frais"', () => {
			document.body.innerHTML = BillsUI({ data: bills });
			const titleElement = screen.getByTestId('content-title');
			expect(titleElement).toBeTruthy();
			expect(titleElement.textContent).toBe(' Mes notes de frais ');
		});
		test('Then, we have a button named "Nouvelle note de frais" and be in the page', () => {
			document.body.innerHTML = BillsUI({ data: bills });
			const buttonElement = screen.getByTestId('btn-new-bill');
			expect(buttonElement).toBeTruthy();
			expect(buttonElement.textContent).toBe('Nouvelle note de frais');
		});

		test('Then, we can click on button', () => {
			document.body.innerHTML = BillsUI({ data: bills });
			const buttonElement = screen.getByTestId('btn-new-bill');
			const handleClick = jest.fn();
			buttonElement.addEventListener('click', handleClick);
			fireEvent.click(buttonElement);
			expect(handleClick).toHaveBeenCalled();
		});
		test('Then, the button have class btn and btn-primary', () => {
			document.body.innerHTML = BillsUI({ data: bills });
			const buttonElement = screen.getByTestId('btn-new-bill');
			// console.log('00000000001' + buttonElement);
			expect(buttonElement).toHaveClass('btn btn-primary');
		});
	});

	describe('When I click on the eye of a bill', () => {
		let billsInstance;

		beforeEach(() => {
			const onNavigate = pathname => {
				document.body.innerHTML = ROUTES({ pathname });
			};

			Object.defineProperty(window, 'localStorage', {
				value: {
					getItem: jest.fn(),
					setItem: jest.fn(),
					clear: jest.fn(),
				},
			});

			window.localStorage.setItem(
				'user',
				JSON.stringify({
					type: 'Employee',
					email: 'a@a',
				})
			);

			document.body.innerHTML = BillsUI({ data: bills });

			billsInstance = new Bills({
				document,
				onNavigate,
				store: mockStore,
				localStorage: window.localStorage,
			});

			const modalElement = document.getElementById('modaleFile');
			$.fn.modal = jest.fn(() => modalElement.classList.add('show'));
		});

		test('Then a modal should appear', async () => {
			const iconEyes = screen.getAllByTestId('icon-eye');
			const handleClickIconEye = jest.fn(billsInstance.handleClickIconEye);

			const modalElement = document.getElementById('modaleFile');

			iconEyes.forEach(iconEye => {
				iconEye.addEventListener('click', () => handleClickIconEye(iconEye));
				fireEvent.click(iconEye);

				expect(handleClickIconEye).toHaveBeenCalled();
				expect(modalElement).toHaveClass('show');
			});
		});
	});
	// TEST INTEGRATION GET
	describe('Given I am a user connected as Employee', () => {
		describe('When I navigate to Bills', () => {
			describe('When an error occurs on API', () => {
				beforeEach(() => {
					jest.spyOn(mockStore, 'bills');
					Object.defineProperty(window, 'localStorage', {
						value: localStorageMock,
					});
					window.localStorage.setItem(
						'user',
						JSON.stringify({ type: 'Employee', email: 'a@a' })
					);
					const root = document.createElement('div');
					root.setAttribute('id', 'root');
					document.body.appendChild(root);
					router();
				});

				test('fetches bills from an API and fails with 404 message error', async () => {
					mockStore.bills.mockImplementationOnce(() => ({
						list: () => Promise.reject(new Error('Erreur 404')),
					}));

					window.onNavigate(ROUTES_PATH.Bills);

					await waitFor(() => {
						const errorMessage = screen.getByText(/Erreur 404/);
						expect(errorMessage).toBeInTheDocument();
						expect(errorMessage.textContent).toContain('Erreur 404');
					});
				});

				test('fetches messages from an API and fails with 500 message error', async () => {
					mockStore.bills.mockImplementationOnce(() => ({
						list: () => Promise.reject(new Error('Erreur 500')),
					}));

					window.onNavigate(ROUTES_PATH.Bills);

					await waitFor(() => {
						const errorMessage = screen.getByText(/Erreur 500/);
						expect(errorMessage).toBeInTheDocument();
						expect(errorMessage.textContent).toContain('Erreur 500');
					});
				});
			});
		});
	});
});
