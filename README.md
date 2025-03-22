# Transpose Rx

Transpose Rx is a lightweight application that allows users to transpose glasses prescription with a negative cylinder to positive instantly.

![Transpose Rx](/public/transposerx.gif)

---

## How It's Made:

Tech used: <br>
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB) <br>
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white) <br>
![DaisyUI](https://img.shields.io/badge/daisyui-5A0EF8?style=for-the-badge&logo=daisyui&logoColor=white)

Packages:
[react-hot-toast](https://github.com/timolins/react-hot-toast) for success and error messages.

Key features:

- Instantly converts glasses prescriptions from negative cylinder to positive formate using a standard optometry formula
- Includes a learning modal to explain the transposition process for better user understanding
- Allows users to copy the transposed prescription in a formatted string (e.g., +2.00 + 1.00 x 180) with a single click
- Provides success/error feedback using react-hot-toast

---

## Optimizations

While this is an MVP, there are several areas for future improvement:

- Implement a feature to save the last 3 transposed prescriptions locally (e.g., using `localStorage`) for quick reference
- Add real-time validation for inputs (e.g., ensure the Axis is between 0 and 180) to prevent invalid submissions
- Ensure the app is fully accessible by adding ARIA labels, keyboard navigation, and screen reader support. As well as improve color contrast for better visibility

---

## Lessons Learned:

- I wanted to practice using useState hooks and better understand React's one-way data flow.
- Learned to implement instant feedback mechanisms to handle invalid inputs - overall, I think this will improve user experience and ensure this application is intuitive and user-friendly
