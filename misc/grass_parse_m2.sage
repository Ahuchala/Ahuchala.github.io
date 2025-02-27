from sage.all import *
import re
import json

# Function to parse the Macaulay2 output file
def parse_macaulay2_output(filename):
    database = {}
    with open(filename, "r") as file:
        for line in file:
            if line.startswith("k,n,r,hodge_numbers"):  # Skip header
                continue
            match = re.match(r"(\d+),(\d+),(\d+),\{([^\}]*)\}", line.strip())
            if match:
                k, n, r, hodge_numbers = match.groups()
                k, n, r = int(k), int(n), int(r)
                hodge_numbers = [poly.strip() for poly in hodge_numbers.split(", ")]
                database[(k, n, r)] = hodge_numbers
            else:
                print(f"Warning: Could not parse line: {line.strip()}")
    return database

# Function to factor a polynomial
def factor_polynomial(polynomial, num_vars):
    # Define the polynomial ring for degrees
    R = PolynomialRing(QQ, num_vars, [f"d_{i+1}" for i in range(num_vars)])
    vars = R.gens()

    # Convert the polynomial to Sage format
    poly = R(polynomial)

    # Factorize the polynomial
    factored_poly = poly.factor()
    return factored_poly

# Function to process the database and output factored polynomials in JSON format
def process_database_to_json(database, output_filename):
    json_output = {}

    for (k, n, r), hodge_numbers in database.items():
        num_vars = r  # Number of hypersurface degrees
        factored_hodge_numbers = []
        for idx, hodge_poly_str in enumerate(hodge_numbers):
            try:
                # Factor the polynomial
                factored_poly = factor_polynomial(hodge_poly_str, num_vars)
                factored_hodge_numbers.append(str(factored_poly))
            except Exception as e:
                print(f"Error processing polynomial {hodge_poly_str}: {e}")
                factored_hodge_numbers.append(f"Error: {e}")

        # Add to JSON structure
        json_output[f"{k},{n},{r}"] = factored_hodge_numbers

    # Write JSON to file
    with open(output_filename, "w") as outfile:
        json.dump(json_output, outfile, indent=4)
    print(f"Factored database written to {output_filename}")

# Main execution
def main():
    input_filename = "grassmannian_hodge_numbers.txt"
    output_filename = "grassmannian_hodge_numbers_factored.json"

    # Parse the Macaulay2 output
    database = parse_macaulay2_output(input_filename)

    # Process the database and output JSON
    process_database_to_json(database, output_filename)

# Run the script
main()
