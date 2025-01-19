import json

def hodge(d, n):
    n -= len(d)  # Adjust dimension for the intersections
    R.<x, y> = PowerSeriesRing(ZZ, default_prec=n + 2)
    H = (1 / ((1 + x) * (1 + y)) * 
         (prod([((1 + x)^di - (1 + y)^di) / (x * (1 + y)^di - y * (1 + x)^di) for di in d]) - 1) +
         1 / (1 - x * y))
    return [H.coefficients()[x^i * y^(n-i)] if x^i * y^(n-i) in H.coefficients() else 0 for i in range(n + 1)]

# Initialize dictionary to store results
results = {}

# Iterate over all possible combinations
for n in range(1, 11):  # n from 1 to 10
    for num_intersections in range(1, 4):  # Up to 3 intersections
        for degrees in cartesian_product([range(1, 11)] * num_intersections):  # Degrees from 1 to 10
            d = sorted(degrees, reverse=True)  # Ensure degrees are sorted and weakly decreasing
            if len(d) >= n:  # Skip codimension zero and special case len(d) == n
                continue
            key = "-".join(map(str, d)) + f",{n}"
            if key not in results:  # Avoid duplicates due to different orderings
                results[key] = hodge(d, n)

# Export the results to a JSON file
with open("hodge_numbers.json", "w") as f:
    json.dump(results, f)
