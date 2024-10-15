/**
 * @jest-environment jsdom
 */

import { screen } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import "@testing-library/jest-dom";

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then ...", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      //to-do write assertion
    });

    test('Then the title sould be "Envoyer une note de frais"', () => {
      document.body.innerHTML = NewBillUI({ data: NewBill });
      const titleElement = screen.getByTestId("content-title");
      expect(titleElement).toBeTruthy();
      expect(titleElement.textContent).toBe(" Envoyer une note de frais ");
    });
    test("Then there is a form with id form-new-bill", () => {
      document.body.innerHTML = NewBillUI({ data: NewBill });
      const formElement = screen.getByTestId("form-new-bill");
      expect(formElement).toBeTruthy();
    });
    test("Then there is a label and a select for expense type", () => {
      document.body.innerHTML = NewBillUI();
      const label = screen.getByText("Type de dépense");
      const select = screen.getByTestId("expense-type");

      expect(label).toBeInTheDocument();
      expect(select).toBeInTheDocument();
      expect(label).toHaveClass("bold-label");
      expect(select).toHaveAttribute("required");
    });
    test("Then the select has the correct options", () => {
      document.body.innerHTML = NewBillUI();
      const select = screen.getByTestId("expense-type");
      const options = Array.from(select.options).map(
        (option) => option.textContent
      );

      expect(options).toEqual([
        "Transports",
        "Restaurants et bars",
        "Hôtel et logement",
        "Services en ligne",
        "IT et électronique",
        "Equipement et matériel",
        "Fournitures de bureau",
      ]);
    });

    test("Then the select has the correct attributes", () => {
      document.body.innerHTML = NewBillUI();
      const select = screen.getByTestId("expense-type");

      expect(select).toHaveAttribute("required");
      expect(select).toHaveClass("form-control", "blue-border");
    });

    // Simuler des dépendances
    describe("NewBill", () => {
      let newBill;
      let mockDocument;
      let mockOnNavigate;
      let mockStore;
      let mockLocalStorage;

      test('Then the input file has data-test id "file"', () => {
        document.body.innerHTML = NewBillUI();
        const inputElement = screen.getByTestId("file");
        expect(inputElement).toBe(true);
      });
      test("Then add listenner event change on the input file", () => {
        document.body.innerHTML = NewBillUI();
        const onNavigateMock = jest.fn();
        const storeMock = {};
        const localStorageMock = {};
        const newBill = new NewBill({
          document,
          onNavigate: onNavigateMock,
          store: storeMock,
          localStorage: localStorageMock,
        });
        const fileInput = screen.getByTestId("file");
        const handleChangeFileSpy = jest.spyOn(newBill, "handleChangeFile");
        fireEvent.change(fileInput, {
          target: { files: [new File([""], "test.txt")] },
        });

        expect(handleChangeFileSpy).toHaveBeenCalled();
      });
      test("Then add listenner event change on the form file", () => {
        document.body.innerHTML = NewBillUI();
        const onNavigateMock = jest.fn();
        const storeMock = {};
        const localStorageMock = {};

        const newBill = new NewBill({
          document,
          onNavigate: onNavigateMock,
          store: storeMock,
          localStorage: localStorageMock,
        });

        const form = screen.getByTestId("form-new-bill");
        const handleSubmitSpy = jest.spyOn(newBill, "handleSubmit");

        fireEvent.submit(form);

        expect(handleSubmitSpy).toHaveBeenCalled();
      });
    });
  });
});
