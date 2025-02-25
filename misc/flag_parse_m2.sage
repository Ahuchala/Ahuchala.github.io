from sage.all import *
import re
import json

def parse_macaulay2_output(filename):
    with open(filename, "r") as file:
        data = json.load(file)
    database = {}
    for key, value in data.items():
        # Expect keys of the form "({1, 1, 1, 1}, 2)"
        m = re.match(r'^\(\{([^}]*)\},\s*(\d+)\)$', key)
        if m:
            partition_str, r = m.groups()
            r = int(r)
            # Convert partition string "1, 1, 1, 1" into a list of ints.
            dims = [int(x.strip()) for x in partition_str.split(",") if x.strip()]
            new_key = f"{dims},{r}"  # key will be like "[1, 1, 1, 1],2"
            # The value is a string of the form "{poly1, poly2, ...}"
            if value.startswith("{") and value.endswith("}"):
                inner = value[1:-1].strip()
                if inner:
                    hodge_numbers = [poly.strip() for poly in inner.split(",")]
                else:
                    hodge_numbers = []
            else:
                hodge_numbers = [value.strip()]
            database[new_key] = hodge_numbers
        else:
            print("Warning: Could not parse key:", key)
    return database

def factor_polynomial(polynomial, num_vars):
    R = PolynomialRing(QQ, num_vars, [f"d_{i+1}" for i in range(num_vars)])
    poly = R(polynomial)
    factored_poly = poly.factor()
    return factored_poly

def process_database_to_json(database, output_filename):
    json_output = {}
    for key, hodge_numbers in database.items():
        # key is of the form "[1, 1, 1, 1],2"
        dims_str, r_str = key.rsplit(",", 1)
        dims = eval(dims_str)  # dims is now a list of ints
        r = int(r_str)
        factored_hodge_numbers = []
        for hodge_poly_str in hodge_numbers:
            try:
                factored_poly = factor_polynomial(hodge_poly_str, r)
                factored_hodge_numbers.append(str(factored_poly))
            except Exception as e:
                print(f"Error processing polynomial {hodge_poly_str}: {e}")
                factored_hodge_numbers.append(f"Error: {e}")
        json_output[f"{dims},{r}"] = factored_hodge_numbers
    with open(output_filename, "w") as outfile:
        json.dump(json_output, outfile, indent=4)
    print(f"Factored database written to {output_filename}")

def main():
    input_filename = "flag_hodge_numbers.txt"
    output_filename = "flag_hodge_numbers_factored.json"
    database = parse_macaulay2_output(input_filename)
    process_database_to_json(database, output_filename)

if __name__ == "__main__":
    main()
