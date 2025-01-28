from sage.all import *
import re

# Function to parse the Macaulay2 output file
def parse_macaulay2_output(filename):
    database = {}
    with open(filename, "r") as file:
        for line in file:
            if line.startswith("k,n,degrees_list,hodge_numbers"):  # Skip header
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

# Function to convert a polynomial to the symmetric basis
def convert_to_symmetric_basis(polynomial, num_vars):
    # Define the symmetric functions
    Sym = SymmetricFunctions(QQ)
    e = Sym.elementary()  # Use the elementary symmetric polynomial basis

    # Define the polynomial ring for degrees
    R = PolynomialRing(QQ, num_vars, [f"d_{i+1}" for i in range(num_vars)])
    vars = R.gens()

    # Convert the polynomial to Sage format
    poly = R(polynomial)

    # Convert to symmetric basis
    symmetric_poly = e.from_polynomial(poly)
    return symmetric_poly

# Function to process the database and rewrite polynomials
def process_database(database, output_filename):
    with open(output_filename, "w") as outfile:
        outfile.write("k,n,r,hodge_index,symmetric_polynomial\n")  # Header row
        for (k, n, r), hodge_numbers in database.items():
            num_vars = r  # Number of hypersurface degrees
            for idx, hodge_poly_str in enumerate(hodge_numbers):
                try:
                    # Convert to symmetric basis
                    symmetric_poly = convert_to_symmetric_basis(hodge_poly_str, num_vars)

                    # Write the result to the output file
                    outfile.write(f"{k},{n},{r},{idx},{symmetric_poly}\n")
                except Exception as e:
                    print(f"Error processing polynomial {hodge_poly_str}: {e}")

# Main execution
def main():
    input_filename = "grassmannian_hodge_numbers.txt"
    output_filename = "grassmannian_hodge_numbers_symmetric.txt"

    # Parse the Macaulay2 output
    database = parse_macaulay2_output(input_filename)

    # Process the database and convert to symmetric basis
    process_database(database, output_filename)
    print(f"Processed database written to {output_filename}")

# Run the script
main()
