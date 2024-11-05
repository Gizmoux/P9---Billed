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
// Mock de la fonction store pour éviter les appels réels à l'API dans les tests
jest.mock('../app/store', () => mockStore);

describe('Given I am connected as an employee', () => {
	describe('When I am on Bills Page', () => {
		// On vérifie que l'icône des factures est mis en évidence
		test('Then bill icon in vertical layout should be highlighted', async () => {
			// Utilisation du mock localStorage pour simuler un utilisateur connecté
			Object.defineProperty(window, 'localStorage', {
				value: localStorageMock,
			});
			// Simule l'enregistrement d'un user dans le localStorage
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
			// Simule la navigation vers la page facture
			window.onNavigate(ROUTES_PATH.Bills);
			// Attente que l'élément soit présent dans le DOM
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
			console.log('dates', dates);

			const antiChrono = (a, b) => (a < b ? 1 : -1);
			console.log('antiChrono', antiChrono);
			const datesSorted = [...dates].sort(antiChrono);
			console.log('datesSorted', datesSorted);
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
			// Initialisation et configuration
			beforeEach(() => {
				jest.spyOn(mockStore, 'bills');
				Object.defineProperty(window, 'localStorage', {
					value: localStorageMock,
				});
				window.localStorage.setItem(
					'user',
					JSON.stringify({ type: 'Employee', email: 'a@a' })
				);
				// Création d'un élément 'div' qui ensuite apparait dans le document
				// Puis initialisation du routage de l'application
				const root = document.createElement('div');
				root.setAttribute('id', 'root');
				document.body.appendChild(root);
				router();
			});
			test('fetches bills from mock API GET', async () => {
				// Espionne la méthode bills pour vérifier qu'elle est appelée
				const billsSpy = jest.spyOn(mockStore, 'bills');

				// simulation pour naviguer vers la page Bills
				window.onNavigate(ROUTES_PATH.Bills);

				// Attente que le texte 'Mes notes de frais' s'affiche
				await waitFor(() => screen.getByText('Mes notes de frais'));
				// Vérifie que la méthode du mock store a été appelée pour récupérer les factures
				expect(billsSpy).toHaveBeenCalled();
				// Vérification que le tableau des factures est chargé
				expect(screen.getByTestId('tbody')).toBeTruthy();
			});
			describe('When an error occurs on API', () => {
				test('fetches bills from an API and fails with 404 message error', async () => {
					// Mock API pour simuler une erreur 404 au lieu d'afficher normalement une liste
					mockStore.bills.mockImplementationOnce(() => ({
						list: () => Promise.reject(new Error('Erreur 404')),
					}));
					// Simulation de la navigation vers la page Bills
					window.onNavigate(ROUTES_PATH.Bills);

					await waitFor(() => {
						// Vérification de l'affichage du message d'erreur 404
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
