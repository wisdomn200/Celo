    import { Contract } from "ethers";
    import { isAddress, parseEther } from "@ethersproject/address";
    import Link from "next/link";
    import { useState } from "react";
    import { useSigner, erc721ABI } from "wagmi";
    import MarketplaceABI from "../../celo/abis/NFTMarketplace.json"
    import Navbar from "@/components/Navbar";
    import styles from "../styles/Create.module.css";
    import { MARKETPLACE_ADDRESS } from "@/constants";

    export default function Create() {
        // State variables to contain Information about the NFT being sold
        const [nftAddress, setNftAddress] = useState("");
        const [tokenId, setTokenId] = useState("");
        const [price, setPrice] = useState("");
        const [loading, setLoading] = useState(false);
        const [showListingLink, setShowListingLink] = useState(false);

        // Get digner from wagmi
        const { data: signer } = useSigner();

        // Main function to be called when `Create` button is clicked
        async function handleCreateListing() {
            // Set Loading status to true
            setLoading(true);
            
            try {
                // Make sure the contract address is a valid address
                const isValidAddress = isAddress(nftAddress);
                if (!isValidAddress) {
                    throw new Error('Invalid contract address');
                }

                // Request approval over NFTs if requires, then create Listing
                await requestApproval();
                await createListing();

                // View NFT details
                setShowListingLink(true);
            } catch (error) {
                console.error(error);
            }

            // Set Loading status to false
            setLoading(false);
        }

        // Function to check if NFT approval is required
        async function requestApproval() {
            // Get Signer's address
            const address = await signer.getAddress();
            
            // Initialize a contract instance for the NFT contract
            const ERC721Contract = new Contract(nftAddress, erc721ABI, signer);

            // Make sure user is owner of the NFT in question    
            const tokenOwner = await ERC721Contract.ownerOf(tokenId);
            if (tokenOwner.toLowerCase() !== address.toLowerCase()) {
                throw new Error("You do not own this NFT")
            }

            // Check if user already gave approval to the marketplace
            const isApproved = await ERC721Contract.isApprovedForAll(
                address,
                MARKETPLACE_ADDRESS
            );
            await approvalTxn.wait();
        }
    }

    // Function to call `createListing` in the marketplace contract
    async function createListing() {
        // Initialize an instance of the marketplace contract
        const MarketplaceContract = new Contract(
            MARKETPLACE_ADDRESS,
            MarketplaceABI,
            signer
        );

     // Send the create listing transaction
     const createListingTxn = await MarketplaceContract.createListing(
        nftAddress,
        tokenId,
        parseEther(print)
     );
     await createListingTxn.wait();
    }

    return (
        <>
          {/* Show the navigation bar */}
          <Navbar />

          {/* Show the input fields for the user to enter contract details */}
          <div className={styles.container}>
            <input 
                type='text'
                placeholder="NFT Address 0x..."
                value={nftAddress}
                onChange={(e) => setNftAddress(e.target.value)}
                />

            <input
                type="text"
                placeholder="Token ID"
                value={tokenId}
                onChange={(e) => setTokenId(e.target.value)}
                />

            <input
                type="text"
                placeholder="Price (in CELO)"
                value={price}
                onChange={(e) => {
                    if (e.target.value === '' ) {
                        setPrice("0");
                    } else {
                        setPrice(e.target.value);
                    }
                }}  
                />
                {/* Button to create the listing */}
                <butto onClick={handleCreateListing} disabled={loading}>
                    {loadeing ? "loading... " : "Create"}
                </butto>

                {/* Button to take user to the NFT details page after listing is created */}
                {showListingLink && (
                    <Link href={`/${nftAddress}/${tokenId}`}>
                        <button>View Listing</button>
                    </Link>
                )}
          </div>
        </>
    )