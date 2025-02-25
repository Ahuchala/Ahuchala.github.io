loadPackage "Schubert2"


-- Function to compute Hodge numbers for a complete intersection in Gr(k,n)
flagHodgeNumbers = (k, n, r) -> (
    -- Initialize the Grassmannian and complete intersection
    G = flagBundle({k, n - k}, base (d_1..d_r));
    X = sectionZeroLocus sum for i from 1 to r list OO_G(d_i);

    -- Compute cotangent bundles
    OmG = cotangentBundle G;
    OmX = cotangentBundle X;

    -- Compute Hodge numbers
    hodgeNumbers = for i from 0 to floor(dim X / 2) list (
        -- (chi exteriorPower(i, OmX) - chi exteriorPower(i, OmG))
        (-1)^(i+k*(n-k)-r) * (chi exteriorPower(i, OmX) - chi exteriorPower(i, OmG))
    );

    return hodgeNumbers;
);  

r = 1;
dims = {1,1,1};
G = flagBundle(dims, base (d_1..d_r));
X = sectionZeroLocus sum for i from 1 to r list OO_G(d_i);
OmG = cotangentBundle G;
OmX = cotangentBundle X;
hodgeNumbers = for i from 0 to floor(dim(X)/2) list (
    (-1)^(i + dim X)*(chi exteriorPower(i, OmX) - chi exteriorPower(i, OmG))
);
hodgeNumbers


-- compute all hodge numbers for O(d_1,d_2,...,d_r) in Gr(k,n)
buildDatabase = (nMin, nMax, kMin, rMin, rMax) -> (
    database = {};
    

    for n from nMin to nMax list (
        for k from kMin to floor(n / 2) list (
            for r from rMin to rMax list ( -- why did we can use other methods to solve for when r = 1
                if k*(n-k)-r > 0 then (
                    try (
                        result = grassmannianHodgeNumbersCI(k, n, r);
                        database = database | {(k, n, r) => result};
                    ) else (
                        << "Failed for (k=" << k << ", n=" << n << ", r=" << r << ")" << endl;
                    )
                );
            )
        )
    );
    return database;
);



-- use this to create CSV file, then convert to JSON using the file in /misc
exportDatabase = (db, filename) -> (
    -- Open the file for writing
    file = filename << "";

    -- Write the header row
    file << "k,n,degrees_list,hodge_numbers" << endl;

    -- Iterate over the database and write each entry
    for entry in db do (
        key = entry#0; -- Extract the key (k, n, degrees_list)
        hodgeNums = entry#1; -- Extract the Hodge numbers

        -- Ensure key is a valid sequence with exactly 3 parts
        if #key === 3 then (
            (k, n, degList) = key; -- Use 'degList' instead of 'degrees'
            -- Convert degList and hodgeNums to string representations
            degListStr = toString degList;
            hodgeNumsStr = toString hodgeNums;
            -- Write the CSV line
            file << k << "," << n << "," << degListStr << "," << hodgeNumsStr << endl;
        ) else (
            -- Skip invalid entries
            print("Skipping invalid entry: " | toString entry);
        );
    );

    -- Close the file
    close file;
);

-- nMin, nMax, kMin, rMin, rMax
db = buildDatabase(9,10,2,1,3);
exportDatabase(db, "grassmannian_hodge_numbers.txt");


-- k = 2
-- n = 5
-- d = [7,1]
-- r = #d
-- G = flagBundle({k, n - k});
-- X = sectionZeroLocus sum for i from 1 to r list OO_G(d#(i-1));

-- -- Compute cotangent bundles
-- OmG = cotangentBundle G;
-- OmX = cotangentBundle X;

-- -- Compute Hodge numbers
-- -- Warning: take absolute values
-- hodgeNumbers = for i from 0 to floor(dim X / 2) list (
--     -- (chi exteriorPower(i, OmX) - chi exteriorPower(i, OmG))
--     (-1)^(i+k*(n-k)-r) * (chi exteriorPower(i, OmX) - chi exteriorPower(i, OmG))
-- )