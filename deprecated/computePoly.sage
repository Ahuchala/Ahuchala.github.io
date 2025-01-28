#This file fits data to an elementary symmetric basis

from sympy import symbols, Eq, solve, expand, simplify

# Define the symmetric polynomial basis
def symmetric_monomials(degree_bound):
    e1, e2 = symbols("e1 e2")
    monomials = []
    for d in range(degree_bound + 1):
        for i in range(d + 1):
            monomials.append(e1**i * e2**(d - i))
    return monomials

# Transform inputs to symmetric basis
def to_symmetric_basis(degree):
    x0, x1 = degree + (0,) * (2 - len(degree))  # Pad to 2 variables
    e1 = x0 + x1  # Sum of inputs
    e2 = x0 * x1  # Product of inputs
    return [e1, e2]

# Parse data into symmetric basis
def parse_data_symmetric(raw_data):
    parsed_data = {}
    for key, values in raw_data.items():
        degree = tuple(sorted(map(int, key.strip("{}").split(","))))  # Sort degrees
        hodge_numbers = list(map(int, values.strip("{}").split(",")))  # Parse Hodge numbers
        symmetric_basis = tuple(to_symmetric_basis(degree))
        parsed_data[symmetric_basis] = hodge_numbers
    return parsed_data

# data = {
#     "{1}": "{0, 0}",
#     "{2}": "{0, 2}",
#     "{3}": "{0, 20}",
#     "{4}": "{1, 89}",
#     "{5}": "{6, 266}",
#     "{6}": "{20, 630}",
#     "{7}": "{50, 1282}",
#     "{8}": "{105, 2345}",
#     "{9}": "{196, 3964}",
#     "{10}": "{336, 6306}"
# }
# Example Usage
data = {

    "{1, 1}": "{0, 1}",
    "{2, 1}": "{0, 5}",
    "{2, 2}": "{1, 19}",
    "{3, 1}": "{1, 19}",
    "{3, 2}": "{6, 57}",
    "{3, 3}": "{20, 137}",
    "{4, 1}": "{5, 51}",
    "{4, 2}": "{19, 135}",
    "{4, 3}": "{49, 283}",
    "{4, 4}": "{103, 527}",
    "{5, 1}": "{14, 109}",
    "{5, 2}": "{44, 269}",
    "{5, 3}": "{99, 519}",
    "{5, 4}": "{189, 899}",
    "{5, 5}": "{324, 1449}",
    "{6, 1}": "{30, 201}",
    "{6, 2}": "{85, 475}",
    "{6, 3}": "{176, 869}",
    "{6, 4}": "{315, 1431}",
    "{6, 5}": "{514, 2209}",
    "{6, 6}": "{785, 3251}",
    "{7, 1}": "{55, 335}",
    "{7, 2}": "{146, 769}",
    "{7, 3}": "{286, 1357}",
    "{7, 4}": "{489, 2155}",
    "{7, 5}": "{769, 3219}",
    "{7, 6}": "{1140, 4605}",
    "{7, 7}": "{1616, 6369}",
    "{8, 1}": "{91, 519}",
    "{8, 2}": "{231, 1167}",
    "{8, 3}": "{435, 2007}",
    "{8, 4}": "{719, 3103}",
    "{8, 5}": "{1099, 4519}",
    "{8, 6}": "{1591, 6319}",
    "{8, 7}": "{2211, 8567}",
    "{8, 8}": "{2975, 11327}",
    "{9, 1}": "{140, 761}",
    "{9, 2}": "{344, 1685}",
    "{9, 3}": "{629, 2843}",
    "{9, 4}": "{1013, 4307}",
    "{9, 5}": "{1514, 6149}",
    "{9, 6}": "{2150, 8441}",
    "{9, 7}": "{2939, 11255}",
    "{9, 8}": "{3899, 14663}",
    "{9, 9}": "{5048, 18737}",
    "{10, 1}": "{204, 1069}",
    "{10, 2}": "{489, 2339}",
    "{10, 3}": "{874, 3889}",
    "{10, 4}": "{1379, 5799}",
    "{10, 5}": "{2024, 8149}",
    "{10, 6}": "{2829, 11019}",
    "{10, 7}": "{3814, 14489}",
    "{10, 8}": "{4999, 18639}",
    "{10, 9}": "{6404, 23549}",
    "{10, 10}": "{8049, 29299}"
}

parsed_data = parse_data_symmetric(data)

# Fit the symmetric polynomial
def fit_symmetric_polynomial(data, hodge_idx, degree_bound):
    e1, e2 = symbols("e1 e2")
    monomials = symmetric_monomials(degree_bound)
    coefficients = symbols(f"a0:{len(monomials)}")  # Coefficients for monomials

    # Construct the polynomial as a linear combination of monomials
    polynomial = sum(c * m for c, m in zip(coefficients, monomials))

    # Prepare equations to solve
    equations = []
    points = list(data.keys())
    values = [data[p][hodge_idx] for p in points]
    for point, value in zip(points, values):
        e1_val, e2_val = point
        equations.append(Eq(polynomial.subs({e1: e1_val, e2: e2_val}), value))

    # Solve for the coefficients
    solution = solve(equations, coefficients, dict=True)
    if solution:
        polynomial = polynomial.subs(solution[0])  # Substitute the solution back into the polynomial
        return simplify(polynomial)
    else:
        return "No solution found or data is inconsistent"

# Main function to fit all Hodge numbers
def fit_all_hodge_numbers(data, degree_bound):
    parsed_data = parse_data_symmetric(data)
    results = {}

    # Loop over all Hodge number indices
    for hodge_idx in range(len(next(iter(parsed_data.values())))):
        polynomial = fit_symmetric_polynomial(parsed_data, hodge_idx, degree_bound)
        results[f"hodge_number_{hodge_idx}"] = polynomial

    return results

# Example Usage
degree_bound = 4  # Guess the degree bound
results = fit_all_hodge_numbers(data, degree_bound)

# Print results
for hodge, poly in results.items():
    print(f"{hodge}: {poly}")
