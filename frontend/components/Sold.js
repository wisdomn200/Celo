import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Listing from '@/components/Listing';
import { createClient } from 'urql';
import styles from '@/styles/Home.module.css'
import { SUBGRAPH_URL } from '@/constants';
import { useAccount } from 'wagmi';

export default function Sold() {

 // State variables to contain sold listings and signify a loading state
 const [listings, setListings] = useState();
 const [loading, setLoading] = useState(false);

 const { isConnected } = useAccount();

 // Function to fetch sold Listings from the subgraph
 async function fetchSoldListings() {
   setLoading(true);
   // The GraphQL query to run
   const soldListingsQuery = ` 
     query SoldListingsQuery {
       listingEntities(where: { buyer_not: null }) {
         id
         nftAddress
         tokenId
         price
         seller
         buyer
       }
     }
   `;

   // Urql client
   const urqlClient = createClient({
     url: SUBGRAPH_URL,
   });

   // Send the query to the subgraph GraphQL API, and get the response
   const response = await urqlClient.query(soldListingsQuery).toPromise();
   const listingEntities = response.data.listingEntities;

   // Update state variables
   setListings(listingEntities);
   setLoading(false)
  }

   useEffect(() => {
     // Fetch sold listings on page load once wallet connection exists
     if (isConnected) {
       fetchSoldListings();
     }
   }, []);

  return (
    <>
     {/* Navbar-Sold Listings  */}
     <Navbar title="Sold Listings" />

     {/* Show loading status if query has not responded yet */}
     {loading && isConnected && <span>Loading...</span>}

     {/* Render the listings */}
     <div className={styles.container}>
      {!loading && 
        listings &&
        listings.map((listing) => {
          return (
            <Listing
              key={listing.id}
              nftAddress={listing.nftAddress}
              tokenId={listing.tokenId}
              price={listing.price}
              seller={listing.seller}
              buyer={listing.buyer}
              />
          );
        })}
     </div>
     {/* Show "No listings found" if query returned empty */}
     {!loading && listings && listings.length === 0 && (
        <span>No sold listings found</span>
     )}
    </>
  );
}
