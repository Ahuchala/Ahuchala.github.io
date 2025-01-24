loadPackage "Schubert2"

-- example usage:
-- k = 2
-- n = 5

-- d = [2,1]
-- grassmannianHodgeNumbersCI(k,n,d)



grassmannianHodgeNumbersCI = (k,n,d) -> (
    G = flagBundle {k,n-k}; -- secretly Gr(k,n)
    -- for d from 1 to 25 list (
    X = sectionZeroLocus(sum for i from 1 to #d list OO_G(d#(i-1))); -- quadric and a cubic
    OmG = cotangentBundle G;
    OmX = cotangentBundle X;

    ls = for i from 0 to floor(dim X / 2) list
        abs(chi exteriorPower(i, OmX) - chi exteriorPower(i, OmG));
    if (false) then (
    -- if (n % 2 ==0) then (
        return join(ls,reverse ls);
    );
    -- include the second half, but don't repeat middle element
    return (join(ls, for i from 1 to #ls-1  list ls#(#ls-i-1)));
);

-- compute all hodge numbers for O(d_1,d_2,...,d_r) in Gr(k,n) for nMin<=n<=nMax, kMin<=k<=n/2, 0<=r<=rMax
buildDatabase = (nMin, nMax, kMin, dMax, rMax) -> (
    database = {};
    
    generateWeaklyDecreasingSequences = (r, maxD) -> (
        if r == 0 then {{}}
        else flatten(for i from 1 to maxD list (
            for seq in generateWeaklyDecreasingSequences(r - 1, i) list (
                {i} | flatten(seq) -- Ensure `seq` is flattened
            )
        ))
    );

    for n from nMin to nMax list (
        for k from kMin to floor(n / 2) list (
            for r from 1 to rMax list ( -- why did we can use other methods to solve for when r = 1
                for d in generateWeaklyDecreasingSequences(r, dMax) list (
                    try (
                        result = grassmannianHodgeNumbersCI(k, n, d);
                        database = database | {(k, n, d) => result};
                    ) else (
                        << "Failed for (k=" << k << ", n=" << n << ", d=" << d << ")" << endl;
                    )
                )
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



-- buildDatabase = (nMin, nMax, kMin, dMax, rMax) ...
-- example: 
-- db = buildDatabase(4,5,2,3,3);
-- exportDatabase(db,"grassmannian_CI_hodge_numbers.csv")


-- buildDatabase(4,10,2,10,4)

