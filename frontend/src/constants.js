export const SUBJECTS = [
  {
    id: 'math',
    name: 'Mathematics',
    icon: '📐',
    chapters: [
      { 
        id: '1', 
        title: 'Linear Equations in Two Variables', 
        content: `### Let’s study.
• Methods of solving linear equations in two variables - graphical method, Cramer’s method
• Equations that can be transformed in linear equation in two variables
• Application of simultaneous equations

### Let’s recall.
**Linear equation in two variables**
An equation which contains two variables and the degree of each term containing variable is one, is called a linear equation in two variables.
ax + by + c = 0 is the general form of a linear equation in two variables; a, b, c are real numbers and a, b are not equal to zero at the same time.
Ex. 3x - 4y + 12 = 0 is the general form of equation 3x = 4y - 12

**Activity**
Complete the following table to check whether the given equations are linear equations in two variables or not.
(1) 4m + 3n = 12 : Yes
(2) 3x² - 7y = 13 : No (Degree is 2)
(3) √2x - √5y = 16 : Yes
(4) 0x + 6y - 3 = 0 : No (a = 0)
(5) 0.3x + 0y - 36 = 0 : No (b = 0)
(6) 4/x + 5/y = 4 : No (Degree is -1)
(7) 4xy - 5y - 8 = 0 : No (Degree of xy is 2)

### Simultaneous linear equations
When we think about two linear equations in two variables at the same time, they are called simultaneous equations.
Last year we learnt to solve simultaneous equations by eliminating one variable. Let us revise it.

**Activity**
To solve the simultaneous equations 5x + 3y = 9 and 2x - 3y = 12.
Add the equations (I) and (II).
5x + 3y = 9 . . . (I)
2x - 3y = 12 . . . (II)
7x = 21
∴ x = 3
Substitute x = 3 in equation (I).
5 × 3 + 3y = 9
15 + 3y = 9
3y = 9 - 15
3y = -6
∴ y = -2
Solution is (x, y) = (3, -2)

**Ex. (1) Solve the following simultaneous equations.**
(1) 5x - 3y = 8; 3x + y = 2

**Solution :**
5x - 3y = 8 . . . (I)
3x + y = 2 . . . (II)
Multiplying both sides of equation (II) by 3.
9x + 3y = 6 . . . (III)
Now let us add equations (I) and (III)
5x - 3y = 8
+ 9x + 3y = 6
--------------
14x = 14
∴ x = 1
substituting x = 1 in equation (II)
3x + y = 2
∴ 3 × 1 + y = 2
∴ 3 + y = 2
∴ y = -1
solution is x = 1, y = -1; it is also written as (x, y) = (1, -1)

**Ex. (2) Solve : 3a + 5b = 26; a + 5b = 22**
**Solution :**
3a + 5b = 26 . . . (I)
a + 5b = 22 . . . (II)
Subtracting equation (II) from (I)
3a + 5b = 26
- a + 5b = 22
--------------
2a = 4
∴ a = 2
Substitute a = 2 in equation (II)
2 + 5b = 22
5b = 20
∴ b = 4
Solution is (a, b) = (2, 4)

**Practice Set 1.1**
1. Complete the following activity to solve the simultaneous equations.
3x + 2y = 29; 5x - y = 18
2. Solve the following simultaneous equations.
(1) 3a + 5b = 26; a + 5b = 22
(2) x + 7y = 10; 3x - 2y = 7
(3) 2x - 3y = 9; 2x + y = 13
(4) 5m - 3n = 19; m - 6n = -7
(5) 5x + 2y = -3; x + 5y = 4
(6) 1/3x + y = 10/3; 2x + 1/4y = 11/4
(7) 99x + 101y = 499; 101x + 99y = 501
(8) 49x - 57y = 172; 57x - 49y = 252

### Graphical method of solving simultaneous linear equations
We know that the graph of a linear equation in two variables is a straight line. The ordered pair which satisfies the equation is a point on that line.
To draw a graph of a linear equation:
1. Find at least 4 ordered pairs for given equation.
2. Draw X-axis, Y-axis on graph paper and plot the points.
3. See that all points lie on a line.

**Ex. Draw graph of x + y = 4; 2x - y = 2**
**Solution :**
x + y = 4
x | 0 | 1 | 2 | 4
y | 4 | 3 | 2 | 0
(x, y) | (0,4) | (1,3) | (2,2) | (4,0)

2x - y = 2
x | 0 | 1 | 2 | 3
y | -2 | 0 | 2 | 4
(x, y) | (0,-2) | (1,0) | (2,2) | (3,4)

The coordinates of the point of intersection are (2, 2).
The solution of given simultaneous equations is x = 2, y = 2.

**Practice Set 1.2**
1. Complete the following table to draw graph of the equations.
(1) x + y = 3 (2) x - y = 4
2. Solve the following simultaneous equations graphically.
(1) x + y = 6; x - y = 4
(2) x + y = 5; x - y = 3
(3) x + y = 0; 2x - y = 9
(4) 3x - y = 2; 2x - y = 3
(5) 3x - 4y = -7; 5x - 2y = 0
(6) 2x - 3y = 4; 3x - y = 2

### Determinant
| a b |
| c d | is a determinant. (a, b), (c, d) are rows and | a | | b | are columns.
| c | | d |
Degree of this determinant is 2, because there are 2 elements in each column and 2 elements in each row. Determinant represents a number which is (ad-bc).
i.e. | a b | = ad - bc
| c d |
Determinants are usually denoted by capital letters like A, B, C, D, . . .

**Ex. Find the values of following determinants.**
(1) A = | 5 3 | = (5 × 9) - (3 × 7) = 45 - 21 = 24
        | 7 9 |
(2) B = | -8 -3 | = (-8 × 4) - (-3 × 2) = -32 - (-6) = -32 + 6 = -26
        | 2 4 |
(3) C = | 2√3 9 | = (2√3 × 3√3) - (9 × 2) = (6 × 3) - 18 = 18 - 18 = 0
        | 2 3√3 |

### Determinant method (Cramer’s Rule)
Using determinants, simultaneous equations can be solved easily and in less space. This method is known as determinant method. This method was first given by a Swiss mathematician Gabriel Cramer, so it is also known as Cramer’s method.

To use Cramer’s method, the equations are written as a1x + b1y = c1 and a2x + b2y = c2.
a1x + b1y = c1 . . . (I)
a2x + b2y = c2 . . . (II)

To remember let us denote:
D = | a1 b1 |
    | a2 b2 |

Dx = | c1 b1 |
     | c2 b2 |

Dy = | a1 c1 |
     | a2 c2 |

∴ x = Dx / D, y = Dy / D

**Ex. Solve the following simultaneous equations using Cramer’s Rule.**
5x + 3y = -11; 2x + 4y = -10
**Solution :**
5x + 3y = -11
2x + 4y = -10
D = | 5 3 | = (5 × 4) - (3 × 2) = 20 - 6 = 14
    | 2 4 |
Dx = | -11 3 | = (-11 × 4) - (3 × -10) = -44 - (-30) = -44 + 30 = -14
     | -10 4 |
Dy = | 5 -11 | = (5 × -10) - (-11 × 2) = -50 - (-22) = -50 + 22 = -28
     | 2 -10 |
x = Dx / D = -14 / 14 = -1
y = Dy / D = -28 / 14 = -2
(x, y) = (-1, -2) is the solution.

**Practice Set 1.3**
1. Fill in the blanks with correct number.
| 3 2 | = 3 × [ ] - [ ] × 4 = [ ] - 8 = [ ]
| 4 5 |
2. Find the values of following determinants.
(1) | -1 7 | (2) | 5 3 | (3) | 7/3 5/3 |
    | 2 4 |     | -7 0 |     | 3/2 1/2 |
3. Solve the following simultaneous equations using Cramer’s rule.
(1) 3x - 4y = 10; 4x + 3y = 5
(2) 4x + 3y - 4 = 0; 6x = 8 - 5y
(3) x + 2y = -1; 2x - 3y = 12
(4) 6x - 4y = -12; 8x - 3y = -2
(5) 4m + 6n = 54; 3m + 2n = 28
(6) 2x + 3y = 2; x - y/2 = 1/2

### Equations reducible to a pair of linear equations in two variables
We can solve a pair of equations which are not linear by substituting the variables.

**Ex. Solve : 4/x + 5/y = 7; 3/x + 4/y = 5**
**Solution :**
4(1/x) + 5(1/y) = 7 . . . (I)
3(1/x) + 4(1/y) = 5 . . . (II)
Replacing 1/x by m and 1/y by n.
4m + 5n = 7 . . . (III)
3m + 4n = 5 . . . (IV)
On solving these equations we get m = 3, n = -1.
Now, m = 1/x = 3 ∴ x = 1/3
n = 1/y = -1 ∴ y = -1
(x, y) = (1/3, -1) is the solution.

**Practice Set 1.4**
1. Solve the following simultaneous equations.
(1) 2/x - 3/y = 15; 8/x + 5/y = 77
(2) 10/(x+y) + 2/(x-y) = 4; 15/(x+y) - 5/(x-y) = -2
(3) 27/(x-2) + 31/(y+3) = 85; 31/(x-2) + 27/(y+3) = 89
(4) 1/[3x+y] + 1/[3x-y] = 3/4; 1/2[3x+y] - 1/2[3x-y] = -1/8

### Application of simultaneous equations
Simultaneous equations are used to solve word problems.
Steps to solve word problems:
1. Read the problem carefully and identify variables.
2. Use given conditions to form two equations.
3. Solve the equations.
4. Check the answer and write the final result with units.

**Ex. (1) The sum of two numbers is 60 and their difference is 10. Find the numbers.**
**Solution :**
Let the greater number be x and the smaller number be y.
From first condition: x + y = 60 . . . (I)
From second condition: x - y = 10 . . . (II)
Adding (I) and (II): 2x = 70 ∴ x = 35
Substituting x = 35 in (I): 35 + y = 60 ∴ y = 25
The numbers are 35 and 25.

**Practice Set 1.5**
1. Two numbers differ by 3. The sum of twice the smaller number and thrice the greater number is 19. Find the numbers.
2. Complete the following. (I am a rectangle... find x and y... find my area and perimeter)
3. The sum of father’s age and twice the age of his son is 70. If we double the age of the father and add it to the age of his son the sum is 95. Find their present ages.
4. The denominator of a fraction is 4 more than twice its numerator. Denominator becomes 12 times the numerator, if both the numerator and the denominator are reduced by 6. Find the fraction.
5. Two types of boxes A, B are to be placed in a truck having capacity of 10 tons...
6. Out of 1900 km, Vishal travelled some distance by bus and some by aeroplane...

**Problem Set - 1**
1. Choose correct alternative for each of the following questions.
2. Complete the following table to draw the graph of 2x - 6y = 3.
3. Solve the following simultaneous equations graphically.
4. Find the values of each of the following determinants.
5. Solve the following equations by Cramer’s method.
6. Solve the following simultaneous equations.
7. Solve the following word problems.`,
        goals: [
          'Define linear equations in two variables',
          'Solve simultaneous equations by elimination',
          'Solve simultaneous equations by substitution',
          'Calculate the value of a determinant',
          'Use Cramer’s Rule to solve equations'
        ],
        quiz: {
          question: "In Cramer's Rule, if D = 0, what can you say about the solution?",
          options: ["Unique solution", "No solution or infinite solutions", "Always one solution"],
          answer: "No solution or infinite solutions"
        }
      },
      { 
        id: '2', 
        title: 'Quadratic Equations', 
        content: `### Let’s study.
• Quadratic equation : Introduction
• Methods of solving quadratic equation
• Nature of roots of quadratic equation
• Relation between roots and coefficients
• Applications of quadratic equations

### Let’s recall.
You have studied polynomials last year. You know types of polynomials according to their degree. When the degree of polynomial is 1 it is called a linear polynomial and if degree of a polynomial is 2 it is called a quadratic polynomial.

**Activity**
Classify the following polynomials as linear and quadratic.
5x + 9; x² + 3x - 5; 3x - 7; 3x² - 5x; 5x²
Linear polynomials: 5x + 9, 3x - 7
Quadratic polynomials: x² + 3x - 5, 3x² - 5x, 5x²

### Standard form of quadratic equation
The equation involving one variable with all indices as whole numbers and having 2 as the maximum index of the variable is called the quadratic equation.
General form is **ax² + bx + c = 0**
In ax² + bx + c = 0, a, b, c are real numbers and a ≠ 0.
ax² + bx + c = 0 is called the standard form of quadratic equation.

**Activity**
Complete the following table.
Quadratic Equation | Standard Form | a | b | c
x² - 4 = 0 | x² + 0x - 4 = 0 | 1 | 0 | -4
y² = 2y - 7 | y² - 2y + 7 = 0 | 1 | -2 | 7
x² + 2x = 0 | x² + 2x + 0 = 0 | 1 | 2 | 0

### Roots of a quadratic equation
In the previous class you have learnt that if value of a polynomial is zero for x = a then (x - a) is a factor of that polynomial. That is if p(x) is a polynomial and p(a) = 0 then a is a root or solution of p(x) = 0.

**Ex. x² + 5x - 6 = 0. Check whether x = -6 and x = 2 are roots.**
**Solution :**
For x = -6, (-6)² + 5(-6) - 6 = 36 - 30 - 6 = 0
∴ x = -6 is a root.
For x = 2, (2)² + 5(2) - 6 = 4 + 10 - 6 = 8 ≠ 0
∴ x = 2 is not a root.

**Practice Set 2.1**
1. Write any two quadratic equations.
2. Decide which of the following are quadratic equations.
3. Write the following equations in the form ax² + bx + c = 0.
4. Determine whether the values given against each quadratic equation are roots.
5. Find k if x = 3 is a root of equation kx² - 10x + 3 = 0.
6. One of the roots of equation 5m² + 2m + k = 0 is -7/5. Complete the activity to find k.

### Solutions of a quadratic equation by factorisation
If the product of two numbers is zero, then at least one of them is zero.
(x - 5)(x + 1) = 0
∴ x - 5 = 0 or x + 1 = 0
∴ x = 5 or x = -1

**Ex. Solve : x² - 15x + 54 = 0**
**Solution :**
x² - 15x + 54 = 0
x² - 9x - 6x + 54 = 0
x(x - 9) - 6(x - 9) = 0
(x - 9)(x - 6) = 0
x = 9 or x = 6
Roots are 9 and 6.

**Practice Set 2.2**
1. Solve the following quadratic equations by factorisation.
(1) x² - 15x + 54 = 0
(2) x² + x - 20 = 0
(3) 2y² + 27y + 13 = 0
(4) 5m² = 22m + 15
(5) 2x² - 2x + 1/2 = 0
(6) 6x - 2/x = 1

### Solution of a quadratic equation by completing the square
(This method is used when the quadratic polynomial cannot be easily factorised.)

### Formula for solving a quadratic equation
ax² + bx + c = 0
**x = [-b ± √(b² - 4ac)] / 2a**

**Ex. Solve : x² + 10x + 2 = 0**
**Solution :**
a = 1, b = 10, c = 2
b² - 4ac = (10)² - 4(1)(2) = 100 - 8 = 92
x = [-10 ± √92] / 2 = [-10 ± 2√23] / 2 = -5 ± √23
Roots are -5 + √23 and -5 - √23.

**Practice Set 2.4**
1. Compare the following quadratic equations to the general form and write values of a, b, c.
2. Solve using formula.
(1) x² + 6x + 5 = 0
(2) x² - 3x - 2 = 0
(3) 3m² + 2m - 7 = 0

### Nature of roots of a quadratic equation
Nature of roots is determined by the value of **b² - 4ac**, called the **discriminant (Δ)**.
(1) If Δ = 0, the roots are real and equal.
(2) If Δ > 0, the roots are real and unequal.
(3) If Δ < 0, the roots are not real.

### Relation between roots and coefficients
If α and β are roots of ax² + bx + c = 0, then:
**α + β = -b/a**
**αβ = c/a**

### To obtain a quadratic equation having given roots
If α and β are roots, the equation is:
**x² - (α + β)x + αβ = 0**

**Practice Set 2.5**
1. Activity : Fill in the gaps.
2. Find the value of discriminant.
3. Determine the nature of roots.
4. Form the quadratic equation from the roots given below.

### Application of quadratic equations
Quadratic equations are useful to solve problems in our daily life.

**Ex. The product of Pragati’s age 2 years ago and 3 years hence is 84. Find her present age.**
**Solution :**
Let Pragati’s present age be x years.
Age 2 years ago = (x - 2)
Age 3 years hence = (x + 3)
(x - 2)(x + 3) = 84
x² + x - 6 = 84
x² + x - 90 = 0
(x + 10)(x - 9) = 0
x = -10 or x = 9
Age cannot be negative. ∴ x = 9
Pragati’s present age is 9 years.

**Practice Set 2.6**
1. Product of Pragati’s age...
2. Sum of squares of two consecutive even natural numbers is 244...
3. In the orange garden of Mr. Madhusudan there are 150 orange trees...
4. Vivek is older than Kishor by 5 years...
5. Suyash scored 10 marks more in second test than that in the first...
6. Mr. Kasam runs a small business of making earthen pots...

**Problem Set - 2**
1. Choose the correct alternative answer for each of the following questions.
2. Which of the following equations is quadratic?
3. Find the value of discriminant for each of the following equations.
4. One of the roots of quadratic equation 2x² + kx - 2 = 0 is -2, find k.
5. Two roots of quadratic equations are given; frame the equation.
6. Determine the nature of roots for each of the following quadratic equations.
7. Solve the following quadratic equations.
8. Find m if (m - 12)x² + 2(m - 12)x + 2 = 0 has real and equal roots.
9. Sum of roots of a quadratic equation is 5 and sum of their cubes is 35; find the equation.
10. Find quadratic equation such that its roots are square of sum of the roots and square of difference of the roots of equation 2x² + 2(p+q)x + p² + q² = 0.
11. Mukund possesses Rs 50 more than what Sagar possesses...
12. The difference between squares of two numbers is 120...
13. Ranjana wants to distribute 540 oranges among some students...
14. Mr. Dinesh owns an agricultural farm at village Talvel...
15. A tank fills completely in 2 hours if both the taps are open...`,
        goals: [
          'Identify quadratic equations in standard form',
          'Solve quadratic equations by factorisation',
          'Solve quadratic equations using the formula',
          'Determine the nature of roots using the discriminant',
          'Apply quadratic equations to solve word problems'
        ],
        quiz: {
          question: "What is the general form of a quadratic equation?",
          options: ["ax + b = 0", "ax² + bx + c = 0", "ax³ + bx² + cx + d = 0"],
          answer: "ax² + bx + c = 0"
        }
      },
      { 
        id: '3', 
        title: 'Arithmetic Progression', 
        content: `### Let’s study.
• Sequence
• Arithmetic Progression
• nth term of an A.P.
• Sum of n terms of an A.P.

### Let’s recall.
**Sequence**
We write numbers 1, 2, 3, 4, . . . in an order. In this order we can tell the position of any number. For example, number 13 is at 13th position. The numbers 1, 4, 9, 16, 25, 36, 49, . . . are also written in a particular order. Here 16 = 4² is at 4th position. similarly, 25 = 5² is at the 5th position; 49 = 7² is at the 7th position. In this set of numbers also, place of each number is determined.

A set of numbers where the numbers are arranged in a definite order, like the natural numbers, is called a sequence.

### Terms in a sequence
In a sequence, ordered terms are represented as t1, t2, t3, . . . . .tn . . . In general sequence is written as {tn}. If the sequence is infinite, for every positive integer n, there is a term tn.

### Arithmetic Progression
In each sequence above, every term is obtained by adding a particular number in the previous term. The difference between two consecutive terms is constant. If the difference between two consecutive terms (tn+1 - tn) is constant then it is called the common difference and is generally denoted by letter d.

In the given sequence if the difference between two consecutive terms (tn+1 - tn) is constant then the sequence is called Arithmetic Progression (A.P.). In this sequence tn+1 - tn = d is the common difference.

**Ex. Check if the sequence 2, 4, 6, 8, . . . is an A.P.**
**Solution :**
t1 = 2, t2 = 4, t3 = 6, t4 = 8
t2 - t1 = 4 - 2 = 2
t3 - t2 = 6 - 4 = 2
t4 - t3 = 8 - 6 = 2
The difference is constant (d = 2). ∴ It is an A.P.

**Practice Set 3.1**
1. Which of the following sequences are A.P.? If they are A.P. find the common difference.
2. Write an A.P. whose first term is a and common difference is d.
3. Find the first term and common difference for each of the A.P.

### nth term of an A. P.
Generally in the A.P. t1, t2, t3, . . . If first term is a and common difference is d,
t1 = a
t2 = t1 + d = a + d = a + (2 - 1) d
t3 = t2 + d = a + d + d = a + 2d = a + (3 - 1)d
t4 = t3 + d = a + 2d + d = a + 3d = a +(4 - 1)d
We get **tn = a +(n - 1) d.**

**Ex. Find the 20th term of the A.P. 7, 13, 19, 25, . . .**
**Solution :**
a = 7, d = 13 - 7 = 6, n = 20
t20 = 7 + (20 - 1)6
t20 = 7 + 19 × 6
t20 = 7 + 114 = 121
The 20th term is 121.

**Practice Set 3.2**
1. Write the correct number in the given boxes from the following A.P.
2. Decide whether following sequence is an A.P., if so find the 20th term.
3. Given A.P. 12, 16, 20, 24, . . . find the 24th term.
4. Find the 19th term of the following A.P. 7, 13, 19, 25, . . .
5. Find the 27th term of the following A.P. 9, 4, -1, -6, -11, . . .
6. Find how many three digit natural numbers are divisible by 5.
7. The 11th term and the 21st term of an A.P. are 16 and 29 respectively, find the 41st term.
8. 11, 8, 5, 2, . . . In this A.P. which term is number -151?
9. In the natural numbers from 10 to 250, how many are divisible by 4?
10. In an A.P. 17th term is 7 more than its 10th term. Find the common difference.

### Sum of first n terms of an A. P.
Arithmetic Progression a, a + d, a + 2d, a + 3d, . . . a +(n - 1)d
In this progression a is the first term and d is the common difference. Let’s write the sum of first n terms as Sn.
**Sn = n/2 [2a + (n - 1)d]**
or
**Sn = n/2 [t1 + tn]**

**Ex. Find the sum of first 100 even natural numbers.**
**Solution :**
A.P. is 2, 4, 6, . . . 200
a = 2, d = 2, n = 100
S100 = 100/2 [2(2) + (100 - 1)2]
S100 = 50 [4 + 198]
S100 = 50 × 202 = 10100
The sum is 10100.

**Practice Set 3.3**
1. First term a = 6 and common difference d = 3, find S27.
2. Find the sum of first 123 even natural numbers.
3. Find the sum of all even numbers between 1 and 350.
4. In an A.P. 19th term is 52 and 38th term is 128, find sum of first 56 terms.
5. Complete the activity to find the sum of natural numbers from 1 to 140 which are divisible by 4.
6. Sum of first 55 terms in an A.P. is 3300, find its 28th term.
7. In an A.P. sum of three consecutive terms is 27 and their product is 504...
8. Find four consecutive terms in an A.P. whose sum is 12 and sum of 3rd and 4th term is 14.
9. If the 9th term of an A.P. is zero, then show that the 29th term is twice the 19th term.

### Application of A.P.
A.P. is used to solve problems related to savings, installments, and arrangements.

**Ex. On 1st Jan 2016, Sanika decides to save Rs 10, Rs 11 on second day, Rs 12 on third day. If she continues like this, what would be her total saving on 31st Dec 2016?**
**Solution :**
Savings: 10, 11, 12, . . .
This is an A.P. with a = 10, d = 1.
2016 is a leap year, so n = 366.
S366 = 366/2 [2(10) + (366 - 1)1]
S366 = 183 [20 + 365]
S366 = 183 × 385 = 70455
Total saving is Rs 70,455.

**Practice Set 3.4**
1. On 1st Jan 2016...
2. A man borrows Rs 8000 and agrees to repay with a total interest of Rs 1360 in 12 monthly installments...
3. Sachin invested in a National Savings Certificate scheme. In the first year he invested Rs 5000, in the second year Rs 7000...
4. There is an auditorium with 27 rows of seats. There are 20 seats in the first row, 22 seats in the second row...
5. Kargil’s temperature was recorded in a week from Monday to Saturday...
6. On the world environment day tree plantation programme was arranged on a land which is triangular in shape...

**Problem Set - 3**
1. Choose the correct alternative answer for each of the following questions.
2. Find the fourth term from the end in an A.P. -11, -8, -5, . . . , 49.
3. In an A.P. the 10th term is 46, sum of the 5th and 7th term is 52. Find the A.P.
4. The API in an A.P. with first term 'a' and common difference 'd' is...
5. Two A.P.’s are given 9, 7, 5, . . . and 24, 21, 18, . . . If nth term of both the progressions are equal then find the value of n and nth term.
6. If sum of 3rd and 8th terms of an A.P. is 7 and sum of 7th and 14th terms is -3, then find the 10th term.
7. In an A.P. the first term is -5 and last term is 45. If sum of all numbers in the A.P. is 120, then how many terms are there? What is the common difference?
8. Sum of 1 to n natural numbers is 36, then find the value of n.
9. Divide 207 in three parts such that all parts are in A.P. and product of two smaller parts is 4623.
10. There are 37 terms in an A.P., the sum of three terms placed exactly at the middle is 225 and the sum of last three terms is 429. Write the A.P.
11. If first term of an A.P. is a, second term is b and last term is c, then show that sum of all terms is (a+c)(b+c-2a) / 2(b-a).
12. If the sum of first p terms of an A.P. is equal to the sum of first q terms, then show that the sum of its first (p+q) terms is zero. (p ≠ q)
13. If m times the mth term of an A.P. is equal to n times nth term, then show that the (m+n)th term of the A.P. is zero.
14. Rs 1000 is invested at 8% simple interest per year. Check at the end of every year if the total interest is in A.P. If so, then find interest amount after 20 years. For this complete the following activity.`,
        goals: [
          'Define sequence and Arithmetic Progression',
          'Find the common difference of an A.P.',
          'Calculate the nth term using the formula',
          'Calculate the sum of first n terms',
          'Apply A.P. to solve real-world problems'
        ],
        quiz: {
          question: "What is the common difference (d) in the sequence 2, 5, 8, 11...?",
          options: ["2", "3", "5"],
          answer: "3"
        }
      },
      { 
        id: '4', 
        title: 'Financial Planning', 
        content: `### Let’s study.
• GST - Introduction
• GST - Tax Invoice
• GST - Computation and ITC
• Shares, Mutual Funds and SIP

### Let’s recall.
**GST (Goods and Service Tax)**
GST stands for Goods and Service Tax. Before GST, every state had a variety of taxes levied at different stages of trading. (Excise Duty, VAT, Octroi, etc.). All these taxes are now subsumed under GST. GST is "One Nation, One Tax, One Market" and came into effect on 1st July 2017.

**Tax Invoice**
A tax invoice for goods or services includes:
• GSTIN: Goods and Service Tax Identification Number (15-digit number).
• HSN code: Harmonized System of Nomenclature (for goods).
• SAC: Service Accounting Code (for services).
• CGST: Central Goods and Service Tax (paid to Central Govt).
• SGST: State Goods and Service Tax (paid to State Govt).
Note: CGST rate is always equal to SGST rate.

**Ex. A dealer in Nagpur supplied 50 color sets at Rs 200 each. GST rate is 12%. Find CGST and SGST.**
**Solution :**
Total value = 50 × 200 = Rs 10,000
GST = 12% of 10,000 = Rs 1,200
CGST = 6% of 10,000 = Rs 600
SGST = 6% of 10,000 = Rs 600
Total invoice amount = 10,000 + 1,200 = Rs 11,200

**Practice Set 4.1**
1. ‘Pawan Pies’ supplied tea and snacks. Total bill is Rs 500. CGST is 2.5%. Find SGST and total GST.
2. On certain article if rate of CGST is 9% then what is the rate of SGST? and what is the rate of GST?
3. ‘M/s. Real Paint’ sold 2 tins of lustre paint and taxable value of each tin is Rs 2800. If the rate of GST is 28%, then find the amount of CGST and SGST charged in the tax invoice.
4. Taxable value of a wrist watch belt is Rs 586. Rate of GST is 18%. Then what is price of the belt for the customer?
5. Total value with GST of a remote-controlled toy car is Rs 1770. Rate of GST is 18% on Toys. Find the taxable value, CGST and SGST for this toy-car.
6. ‘Tiptop Electronics’ supplied an AC of 1.5 ton to a company. Cost of the AC supplied is Rs 51,200 (with GST). Rate of CGST on AC is 14%. Then find the following amounts as shown in the tax invoice of Tiptop Electronics.
7. Prasad purchased a washing-machine from ‘Maharashtra Electronic Goods’. The discount of 5% was given on the printed price of Rs 40,000. Rate of GST charged was 28%. Find the purchase price of washing machine. Also find the amount of CGST and SGST shown in the tax invoice.

### Input Tax Credit (ITC)
When a trader pays GST at the time of purchase, it is called 'Input Tax'. When he collects GST at the time of sale, it is called 'Output Tax'.
**GST payable = Output Tax - Input Tax Credit (ITC)**

**Practice Set 4.2**
1. ‘Chetana Store’ paid total GST of Rs 1,00,500 at the time of purchase and collected GST Rs 1,22,500 at the time of sale during 1st of July 2017 to 31st July 2017. Find the GST payable by Chetana Stores.
2. Nazama is a proprietor of a firm, registered under GST. She has paid GST of Rs 12,500 on purchase and collected Rs 14,750 on sale. What is the amount of ITC to be claimed? What is the amount of GST payable?
3. Amir Enterprise purchased chocolate sauce bottles and paid GST of Rs 3800. He sold those bottles to Akbari Bros. and collected GST of Rs 4100. Mayank Food Corner purchased these bottles from Akbari Bros. and paid GST of Rs 4500. Find the amount of GST payable at every stage of trading and hence find payable CGST and SGST.
4. Malik Gas Agency (Chandigarh Union Territory) purchased some gas cylinders for industrial use for Rs 24,500, and sold them to the local customers for Rs 26,500. Find the GST to be paid at the rate of 5% and hence the CGST and UTGST to be paid for this transaction. (for Union Territories there is UTGST instead of SGST).
5. M/s Beauty Products paid 18% GST on cosmetics worth Rs 6000 and sold to a customer for Rs 10,000. What are the amounts of CGST and SGST shown in the tax invoice issued?
6. Prepare Business to Consumer (B2C) tax invoice using given information...
7. Prepare Business to Business (B2B) tax invoice as per the details given below...

### Shares
• Capital: The amount required to start a company.
• Share: The smallest unit of the capital.
• Face Value (FV): The value printed on the share certificate.
• Market Value (MV): The price at which shares are sold or purchased in the stock market.
• Dividend: The part of annual profit distributed per share among shareholders.

**Practice Set 4.3**
1. Complete the following table by writing proper numbers and words.
2. Shri Amol purchased 50 shares of Face Value Rs 100 when the Market Value was Rs 80. Company had given 20% dividend. Find the rate of return on investment.
3. Joseph purchased following shares, find his total investment.
4. Smt. Deshpande purchased shares of FV Rs 5 at a premium of Rs 20. How many shares will she get for Rs 20,000?
5. Shri Shantilal has purchased 150 shares of FV Rs 100, for MV of Rs 120. Company has paid dividend at 7%. Find the rate of return on his investment.
6. If MV > FV then the share is at premium. If MV = FV then the share is at par. If MV < FV then the share is at discount.

### Mutual Fund - MF
A group of persons come together to form a company and raise capital by issuing shares. To reduce risk, people invest in Mutual Funds where money is diversified into different schemes by professional experts.
• NAV (Net Asset Value): The market value of 'a unit' of a mutual fund.
• SIP (Systematic Investment Plan): Investing small amounts at regular intervals.

**Practice Set 4.4**
1. Market value of a share is Rs 200. If the brokerage rate is 0.3% then find the purchase value of the share.
2. A share is sold for the Market Value of Rs 1000. Brokerage is paid at the rate of 0.1%. What is the amount received after the sale?
3. Fill in the blanks in the given contract note of sale-purchase of shares...
4. Smt. Desai sold shares of face value Rs 100 when the market value was Rs 50 and received Rs 4988.20. She paid brokerage 0.2% and GST on brokerage 18%, then how many shares did she sell?
5. Mr. D’souza purchased 200 shares of FV Rs 50 at a premium of Rs 100. He received 50% dividend on the shares. After receiving the dividend he sold 100 shares at a discount of Rs 10 and remaining shares were sold at a premium of Rs 75. For each transaction he paid the brokerage of Rs 20. Find whether Mr. D’souza gained or incurred a loss, by how much?

**Problem Set - 4A**
1. Write the correct alternative answer for each of the following questions.
2. A dealer has given 10% discount on a showpiece of Rs 25,000. GST of 28% was charged on the discounted price. Find the total amount shown in the tax invoice. What is the amount of CGST and SGST?
3. A ready-made garment shopkeeper gives 5% discount on the dress of Rs 1000 and charges 5% GST on the remaining amount, then what is the purchase price of the dress for the customer?
4. A trader from Surat, Gujarat sold cotton clothes to a trader in Rajkot, Gujarat. The taxable value of cotton clothes is Rs 2.5 lacs. What is the amount of GST at 5% paid by the trader in Rajkot?
5. Smt. Malhotra purchased solar panels for the taxable value of Rs 85,000. She sold them for Rs 90,000. The rate of GST is 5%. Find the ITC of Smt. Malhotra. What is the amount of GST payable by her?
6. A company provided Z-security services for the taxable value of Rs 64,500. Rate of GST is 18%. Company had paid GST of Rs 1550 for laundry services and uniforms etc. What is the amount of ITC (Input Tax Credit)? Find the amount of CGST and SGST payable by the company.
7. A dealer supplied Walky-Talky set of Rs 84,000 (with GST) to police control room. Rate of GST is 12%. Find the amount of state and central GST charged by the dealer. Also find the taxable value of the set.
8. A wholesaler purchased electric goods for the taxable amount of Rs 1,50,000. He sold it to the retailer for the taxable amount of Rs 1,80,000. Retailer sold it to the customer for the taxable amount of Rs 2,20,000. Rate of GST is 18%. Show the computation of GST in tax invoices of sales. Also find the payable CGST and payable SGST for wholesaler and retailer.
9. Anna Patil (Thane, Maharashtra) supplied vacuum cleaner to a shopkeeper in Vasai (Mumbai) for the taxable value of Rs 14,000, and GST rate of 28%. Shopkeeper sold it to the customer at the same GST rate for Rs 16,800 (taxable value). Find the following: (1) Amount of CGST and SGST shown in the tax invoice issued by Anna Patil. (2) Amount of CGST and SGST charged by the shopkeeper in Vasai. (3) What is the CGST and SGST payable by Shopkeeper in Vasai at the time of filing the return?
10. For the given trading chain prepare the tax invoices...

**Problem Set - 4B**
1. Write the correct alternative answer for each of the following questions.
2. Find the purchase price of a share of FV Rs 100 if it is at a premium of Rs 30. The brokerage rate is 0.3%.
3. Prashant bought 50 shares of FV Rs 100, having MV Rs 180. Company gave 40% dividend. Find the rate of return on investment.
4. Find the amount received when 300 shares of FV Rs 100, were sold at a discount of Rs 30. Brokerage 0.1%.
5. Find the number of shares received when Rs 60,000 was invested in the shares of FV Rs 100 and MV Rs 120.
6. Smt. Aruna Thakare purchased 100 shares of FV Rs 100 when MV was Rs 1200. She paid brokerage at the rate of 0.3% and 18% GST on brokerage. Find the following: (1) Net amount paid for 100 shares. (2) Brokerage paid on sum invested. (3) GST paid on brokerage. (4) Total amount paid for 100 shares.
7. Market value of shares and dividend declared by the two companies is given below. FV is same and it is Rs 100 for both the companies. Company A – MV = Rs 132, dividend 12%. Company B – MV = Rs 144, dividend 16%. In which company the investment is more profitable?
8. Shri. Aditya Sanghavi invested Rs 50,118 in shares of FV Rs 100, when MV is Rs 50. Rate of brokerage is 0.2% and GST on brokerage is 18%, then How many shares did he purchase for Rs 50,118?
9. Shri. Batliwala sold shares of FV Rs 100 and MV Rs 150. He received Rs 49,852.50 after paying brokerage 0.2% and GST on brokerage 18%, then how many shares did he sell?
10. Shri. Deshpande invested Rs 20,000 in Mutual Fund. At that time NAV was Rs 80. After some days he sold all units when NAV was Rs 400. He paid brokerage 0.5% on sale value. Find his profit or loss.
11. Help the following people to find their investment...
12. Smt. Anagha Doshe deposited Rs 1,00,000 in a bank at 8% compound interest...`,
        goals: [
          'Understand the concept of GST',
          'Read and understand a Tax Invoice',
          'Calculate GST payable using ITC',
          'Learn basic terminology of Shares',
          'Understand Mutual Funds and SIP'
        ],
        quiz: {
          question: "If the GST rate is 18%, what are the rates of CGST and SGST?",
          options: ["9% each", "18% each", "CGST 12%, SGST 6%"],
          answer: "9% each"
        }
      },
      { 
        id: '5', 
        title: 'Probability', 
        content: `### Let’s study.
• Probability : Introduction
• Random experiment and its outcome
• Sample space and event
• Probability of an event

### Let’s recall.
In our day to day life, we use words like 'probably', 'likely', 'chance', 'impossible', 'sure', 'nearly', '50-50' etc. These words indicate a degree of uncertainty.
In mathematics, we can measure this uncertainty by means of 'Probability'.

### Random Experiment
The experiment in which all possible results are known in advance but none of them can be predicted with certainty, and there is equal possibility for each result is known as a 'Random Experiment'.
**Ex.** Tossing a coin, throwing a die, picking a card from a pack of well shuffled playing cards.

### Outcome
Result of a random experiment is known as an 'Outcome'.
**Ex.**
1. In a random experiment of tossing a coin, there are only two outcomes: Head (H) or Tail (T).
2. In a random experiment of throwing a die, there are 6 outcomes: 1, 2, 3, 4, 5, 6.

### Equally Likely Outcomes
A given number of outcomes are said to be equally likely if none of them can be expected to occur in preference to others.
**Ex.** If a coin is tossed, possibilities of getting head or tail are equal.

**Practice Set 5.1**
1. How many possibilities are there in each of the following?
(1) Vanita knows the following sites in Maharashtra. She is planning to visit one of them in her summer vacation. Ajanta, Mahabaleshwar, Lonar Sarovar, Tadoba wild life sanctuary, Amboli, Raigad, Matheran, Anandwan.
(2) Any day of a week is to be selected randomly.
(3) Select one card from the pack of 52 cards.
(4) One number from 10 to 20 is written on each card. Select one card randomly.

### Sample Space
The set of all possible outcomes of a random experiment is called the sample space. It is denoted by 'S' or 'Ω' (omega). Each element of sample space is called a 'sample point'. The number of elements in the set S is denoted by n(S).

**Ex.**
1. One coin is tossed: S = {H, T}, n(S) = 2
2. Two coins are tossed: S = {HH, HT, TH, TT}, n(S) = 4
3. A die is thrown: S = {1, 2, 3, 4, 5, 6}, n(S) = 6

**Practice Set 5.2**
1. For each of the following experiments write sample space 'S' and number of sample points n(S).
(1) One coin and one die are thrown simultaneously.
(2) Two digit numbers are formed using digits 2, 3 and 5 without repeating a digits.
2. The arrow is rotated and it stops randomly on the disc. Find out on which colour it may stop.
3. In the month of March 2019, find the days on which the date is a multiple of 5. (see the given page of the calendar).
4. Form a 'Road safety committee' of two, from 2 boys (B1, B2) and 2 girls (G1, G2). Complete the following activity to write the sample space.

### Event
The outcomes satisfying particular condition are called favourable outcomes. A set of favourable outcomes of a given sample space is an 'event'. Event is a subset of the sample space.

**Ex. Two coins are tossed. Let A be the event of getting at least one head.**
**Solution :**
S = {HH, HT, TH, TT}, n(S) = 4
A = {HH, HT, TH}
n(A) = 3

**Practice Set 5.3**
1. Write sample space 'S' and number of sample point n(S) for each of the following experiments. Also write events A, B, C in the set form and write n(A), n(B), n(C).
(1) One die is rolled...
(2) Two dice are rolled simultaneously...
(3) Three coins are tossed simultaneously...
(4) Two digit numbers are formed using digits 0, 1, 2, 3, 4, 5 without repetition of the digits...
(5) From three men and two women, environment committee of two persons is to be formed...
(6) One coin and one die are thrown simultaneously...

### Probability of an Event
In mathematical language, when possibility of an expected event is expressed in number, it is called 'Probability'.
For a random experiment, if sample space is S and A is an expected event, then probability of A is P(A).
**P(A) = n(A) / n(S)**
Probability is expressed as a fraction or a percentage. It is always between 0 and 1.

**Ex. A card is drawn from a pack of 52 playing cards. Find the probability of getting an ace.**
**Solution :**
n(S) = 52
Event A: getting an ace.
There are 4 aces in a pack. ∴ n(A) = 4
P(A) = n(A) / n(S) = 4 / 52 = 1 / 13

**Practice Set 5.4**
1. If two coins are tossed, find the probability of the following events. (1) Getting at least one head. (2) Getting no head.
2. If two dice are rolled, find the probability of the following events. (1) The sum of the digits on the upper faces is at least 10. (2) The sum of the digits on the upper faces is 33. (3) The digit on the first die is greater than the digit on second die.
3. There are 15 tickets in a box, each bearing one of the numbers from 1 to 15. One ticket is drawn at random from the box. Find the probability of event that the ticket drawn - (1) shows an even number. (2) shows a number which is a multiple of 5.
4. A two digit number is formed with digits 2, 3, 5, 7, 9 without repetition. What is the probability that the number formed is (1) an odd number? (2) a multiple of 5?
5. A card is drawn at random from a pack of 52 well shuffled playing cards. Find the probability that the card drawn is - (1) an ace. (2) a spade.

**Problem Set - 5**
1. Choose the correct alternative answer for each of the following questions.
2. Basketball players John, Vasim, Akash were practising the ball drop in the basket. The probabilities of success for John, Vasim and Akash are 4/5, 0.83 and 58% respectively. Who had the greatest probability of success?
3. A hockey team has 6 defenders, 4 attackers and 1 goli. Out of these, one player is to be selected randomly as a captain. Find the probability of the selection that - (1) The goli will be selected. (2) A defender will be selected.
4. Joseph kept 26 cards in a cap, bearing one English alphabet on each card. One card is drawn at random. What is the probability that the card drawn is a vowel card?
5. A balloon vendor has 2 red, 3 blue and 4 green balloons. He wants to choose one of them at random to give it to Pranali. What is the probability of the event that Pranali gets, (1) a red balloon (2) a blue balloon (3) a green balloon.
6. A box contains 5 red, 8 white and 4 green marbles. One marble is taken out of the box at random. What is the probability that the marble taken out is (1) white? (2) not white?
7. A die is thrown. If the probability of getting an even number is 1/2 and the probability of getting a number less than 3 is 1/3, then find the probability of getting an even number or a number less than 3.
8. A card is drawn at random from a pack of 52 well shuffled playing cards. Find the probability that the card drawn is (1) a red card (2) a face card.
9. Length and breadth of a rectangular garden are 77 m and 50 m. There is a circular lake in the garden having diameter 14 m. Due to wind, a towel from a terrace on a nearby building fell into the garden. Then find the probability of the event that it fell in the lake.
10. In a game of chance, a spinning arrow comes to rest at one of the numbers 1, 2, 3, 4, 5, 6, 7, 8. All these are equally likely outcomes. Find the probability that it will rest at (1) 8. (2) an odd number. (3) a number greater than 2. (4) a number less than 9.
11. There are six faces of a die, and letters as given below are on them...
12. A box contains 30 tickets, bearing only one number from 1 to 30 on each. If one ticket is drawn at random, find the probability of an event that the ticket drawn bears (1) an odd number. (2) a complete square number.
13. A card is drawn at random from a pack of 52 well shuffled playing cards. Find the probability that the card drawn is (1) a king (2) a diamond.
14. Out of 200 students from a school, 135 like Kabaddi and the remaining students do not like the game. If one student is selected at random from all the students, find the probability that the student selected doesn’t like Kabaddi.
15. A two digit number is formed with digits 0, 1, 2, 3, 4 without repetition. What is the probability that the number formed is (1) a prime number? (2) a multiple of 4? (3) a multiple of 11?
16. The faces of a die bear numbers 0, 1, 2, 3, 4, 5. If the die is rolled twice, then find the probability that the product of digits on the upper faces is zero.`,
        goals: [
          'Define random experiment and outcome',
          'Identify sample space and sample points',
          'Define an event as a subset of sample space',
          'Calculate the probability of an event'
        ],
        quiz: {
          question: "What is the probability of getting a Head when a fair coin is tossed?",
          options: ["0", "1/2", "1"],
          answer: "1/2"
        }
      },
      { 
        id: '6', 
        title: 'Statistics', 
        content: `### Let’s study.
• Measures of a central tendency: Mean, Median, Mode
• Graphical representation: Histogram, Frequency Polygon, Pie Diagram

### Let’s recall.
**Measures of Central Tendency**
The scores in a numerical data have a tendency to cluster around a particular score. This representative number is called the measure of central tendency.

### Mean (X̄)
The average of all scores. For grouped frequency distribution, it can be calculated by:
• **Direct Method:** X̄ = Σ(xi * fi) / Σfi
• **Assumed Mean Method:** X̄ = A + d̄, where d̄ = Σ(fi * di) / Σfi
• **Step Deviation Method:** X̄ = A + ū * g, where ū = Σ(fi * ui) / Σfi

**Ex. Find the mean of the following frequency distribution.**
**Solution : (Direct Method)**
| Class | xi | fi | xi * fi |
|---|---|---|---|
| 0-10 | 5 | 2 | 10 |
| 10-20 | 15 | 3 | 45 |
| 20-30 | 25 | 5 | 125 |
X̄ = 180 / 10 = 18.

**Practice Set 6.1**
1. The following table shows the number of students and the time they utilized daily for their studies. Find the mean time spent by students by direct method.
2. In the following table, the toll paid by drivers and the number of vehicles is shown. Find the mean of the toll by 'assumed mean' method.
3. A milk centre sold milk to 50 customers. The table below shows the number of customers and the milk they purchased. Find the mean of the milk sold by 'step deviation' method.
4. The amount of frequency distribution of daily wages of 50 workers is given below. Find the mean of daily wages by 'step deviation' method.
5. The following frequency distribution table shows the amount of aid given to 50 flood affected families. Find the mean amount of aid by 'assumed mean' method.
6. The following table gives the information of frequency distribution of weekly pocket money of 150 students of class 10. Find the mean of pocket money by 'step deviation' method.

### Median
The middle score when data is arranged in ascending order. For grouped data:
**Median = L + [(N/2 - cf) / f] * h**
Where:
L = Lower limit of median class
N = Total frequency
cf = Cumulative frequency of preceding class
f = Frequency of median class
h = Class interval

**Practice Set 6.2**
1. The following table shows classification of number of workers and the number of hours they work in a software company. Find the median of the number of hours they work.
2. The frequency distribution table shows the number of mango trees in a grove and their yield of mangoes. Find the median of data.
3. The following table shows the classification of number of vehicles and their speed on Mumbai-Pune expressway. Find the median of the data.
4. The production of electric bulbs in different factories is shown in the following table. Find the median of the productions.

### Mode
The score which occurs maximum number of times. For grouped data:
**Mode = L + [(f1 - f0) / (2f1 - f0 - f2)] * h**
Where:
L = Lower limit of modal class
f1 = Frequency of modal class
f0 = Frequency of preceding class
f2 = Frequency of succeeding class
h = Class interval

**Practice Set 6.3**
1. The following table shows the information regarding the milk collected from farmers on a milk collection centre and the content of fat in the milk, measured by a lactometer. Find the mode of fat content.
2. The following table shows the classification of number of patients and their ages admitted to a hospital in a particular day. Find the mode of their ages.
3. The following table shows the classification of number of families and the milk they use daily. Find the mode of the amount of milk used.
4. The following frequency distribution table gives the ages of 200 patients treated in a hospital in a week. Find the mode of ages of the patients.

### Graphical Representation
• **Histogram:** A graphical representation of frequency distribution using rectangles.
• **Frequency Polygon:** A line graph formed by joining midpoints of the tops of histogram rectangles.
• **Pie Diagram:** A circular graph where the area of each sector is proportional to the frequency.
**Central Angle (θ) = (Frequency of component / Total frequency) * 360°**

**Practice Set 6.4**
1. Draw a histogram of the following data.
2. Draw a histogram of the following data.
3. In the following table, the investment made by 210 families is shown. Present it in the form of a histogram.
4. Time allotted for the preparation of an examination by some students is shown in the table. Draw a histogram to show the information.

**Practice Set 6.5**
1. Observe the following frequency polygon and write the answers of the questions given below it.
2. Show the following data by a frequency polygon.
3. The following table shows the classification of percentage of marks of students and the number of students. Draw a frequency polygon from the table.

**Practice Set 6.6**
1. The age group and number of persons, who donated blood in a blood donation camp is given below. Find the central angle from the data and draw a pie diagram.
2. The marked price of different items which are mainly used in school and the number of items is given in the following table. Draw a pie diagram to show the information.
3. In a tree plantation programme, the number of trees planted by students of different classes is given in the following table. Draw a pie diagram showing the information.
4. The following table shows the percentages of vehicles passing a signal on a busy road in a particular time interval. Draw a pie diagram for the data.
5. The following table shows the amounts of different components used in the preparation of a particular type of food. Draw a pie diagram to show the information.
6. The following table shows the number of students of a school, who like different games. Draw a pie diagram to show the information.

**Problem Set - 6**
1. Choose the correct alternative answer for each of the following questions.
2. The following table shows the income of 200 families. Find the median of the data.
3. The following table shows the classification of number of workers and the number of hours they work in a factory. Find the mode of the number of hours they work.
4. The following table shows the classification of number of trees and their height in a forest. Find the mean height of the trees by 'step deviation' method.
5. The following frequency distribution table shows the amount of aid given to 50 flood affected families. Find the median amount of aid.
6. The following table gives the information of frequency distribution of weekly pocket money of 150 students of class 10. Find the mode of pocket money.
7. The following table shows the classification of number of patients and their ages admitted to a hospital in a particular day. Find the median of their ages.
8. The following table shows the classification of number of families and the milk they use daily. Find the mean of the amount of milk used by 'assumed mean' method.
9. The following frequency distribution table gives the ages of 200 patients treated in a hospital in a week. Find the median of ages of the patients.
10. The following table shows the percentages of vehicles passing a signal on a busy road in a particular time interval. Draw a frequency polygon for the data.
11. The following table shows the amounts of different components used in the preparation of a particular type of food. Draw a histogram for the data.
12. The following table shows the number of students of a school, who like different games. Draw a frequency polygon to show the information.
13. The following table shows the classification of number of workers and the number of hours they work in a factory. Draw a frequency polygon for the data.
14. The following table shows the classification of number of trees and their height in a forest. Draw a pie diagram for the data.
15. The following frequency distribution table shows the amount of aid given to 50 flood affected families. Draw a pie diagram for the data.
16. The following table gives the information of frequency distribution of weekly pocket money of 150 students of class 10. Draw a pie diagram for the data.`,
        goals: [
          'Calculate Mean using different methods',
          'Find the Median and Mode of grouped data',
          'Construct and interpret Histograms',
          'Draw Frequency Polygons',
          'Create and analyze Pie Diagrams'
        ],
        quiz: {
          question: "What is the formula for the central angle in a pie diagram?",
          options: ["(f/Σf) * 100", "(f/Σf) * 360", "(Σf/f) * 360"],
          answer: "(f/Σf) * 360"
        }
      }
    ]
  },
  {
    id: 'science',
    name: 'Science',
    icon: '🧪',
    chapters: [
      { id: '1', title: 'Chemical Reactions', content: 'A chemical reaction is a process that leads to the chemical transformation of one set of chemical substances to another...' },
      { id: '2', title: 'Life Processes', content: 'Life processes are the basic functions performed by living organisms to maintain their life on earth...' },
      { id: '3', title: 'Light - Reflection and Refraction', content: 'Light is a form of energy that enables us to see things. Reflection is the bouncing back of light...' }
    ]
  },
  {
    id: 'social',
    name: 'Social Science',
    icon: '🌍',
    chapters: [
      { id: '1', title: 'The Rise of Nationalism in Europe', content: 'Nationalism is an ideology and movement that promotes the interests of a particular nation...' },
      { id: '2', title: 'Resources and Development', content: 'Resources are everything available in our environment which can be used to satisfy our needs...' },
      { id: '3', title: 'Power Sharing', content: 'Power sharing is a strategy wherein all the major segments of the society are provided with a permanent share of power...' }
    ]
  }
];

export const APTITUDE_QUESTIONS = [
  {
    id: 1,
    question: "If a train travels 120 km in 2 hours, what is its speed?",
    options: ["40 km/h", "50 km/h", "60 km/h", "70 km/h"],
    correct: "60 km/h"
  },
  {
    id: 2,
    question: "What is the next number in the sequence: 2, 4, 8, 16, ...?",
    options: ["24", "30", "32", "40"],
    correct: "32"
  },
  {
    id: 3,
    question: "Which of these is a prime number?",
    options: ["9", "15", "21", "23"],
    correct: "23"
  }
];
