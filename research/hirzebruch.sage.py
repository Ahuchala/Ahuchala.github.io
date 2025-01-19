

# This file was *autogenerated* from the file hirzebruch.sage
from sage.all_cmdline import *   # import sage library

_sage_const_10 = Integer(10); _sage_const_6 = Integer(6); _sage_const_2 = Integer(2); _sage_const_1 = Integer(1); _sage_const_0 = Integer(0)
import json

MAX_DIM = _sage_const_10 
MAX_DEGREE = _sage_const_10 
MAX_NUM_HYPERSURFACES = _sage_const_6 

def hodge(d, n):
    n -= len(d)  # Adjust dimension for the intersections
    R = PowerSeriesRing(ZZ, default_prec=n + _sage_const_2 , names=('x', 'y',)); (x, y,) = R._first_ngens(2)
    H = (_sage_const_1  / ((_sage_const_1  + x) * (_sage_const_1  + y)) * 
         (prod(((_sage_const_1  + x)**di - (_sage_const_1  + y)**di) / (x * (_sage_const_1  + y)**di - y * (_sage_const_1  + x)**di) for di in d) - _sage_const_1 ) +
         _sage_const_1  / (_sage_const_1  - x * y))
    # Compute only the first (n-k)+1 terms because of Hodge symmetry
    left_half = [int(H.coefficients()[x**i * y**(n-i)] if x**i * y**(n-i) in H.coefficients() else _sage_const_0 ) 
                 for i in range((n // _sage_const_2 ) + _sage_const_1 )]
    return left_half

# Initialize dictionary to store results
results = {}

# Iterate over all possible combinations
for n in range(_sage_const_1 , MAX_DIM+_sage_const_1 ):  # n from 1 to 10
    for num_intersections in range(_sage_const_1 , MAX_NUM_HYPERSURFACES+_sage_const_1 ):
        for degrees in cartesian_product([range(_sage_const_1 , MAX_DEGREE+_sage_const_1 )] * num_intersections):  # Degrees from 1 to 10
            d = sorted(degrees, reverse=True)  # Ensure degrees are sorted and weakly decreasing
            if len(d) >= n:  # Skip codimension zero and special case len(d) == n
                continue
            key = "-".join(map(str, d)) + f",{n}"
            if key not in results:  # Avoid duplicates due to different orderings
                results[key] = hodge(d, n)

# Convert all data to native Python types before saving
results = {key: [int(value) for value in values] for key, values in results.items()}

# Export the results to a JSON file
with open("hodge_numbers.json", "w") as f:
    json.dump(results, f)

