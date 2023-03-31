import { useEffect, useState } from "react";
import { useAccount, useContract, useProvider, erc721ABI } from "wagmi";
import { formatEther, formatUnits } from "ethers/lib/utils";

export default function Listing(props) {
    // State variables to hold informatiom about the NFT
    const [imageURI, setImageURI] = useState("");
    const [name, setName] = useState("");

    // Loading state
    const [Loading, setLoading] = useState(true);

    // Get the provider, connected address, and a contract instance
    // for the NFT contract using wagmi
    const provider = useProvider();
    const { address } = useAccount();
    const ERC721Contract = useContract({
        address: props.nftAddress,
        abi: erc721ABI,
        signerOrProvider: provider,
    });

    // Check if the NFT seller is the connected user
    const isOwner = address.toLowerCase() === props.seller.toLowerCase();

    // Fetch NFT details by resolving the token URI
    async function fetchNFTDetails() {
        try {
            // Get token URI from contract
            let tokenURI = await ERC721Contract.tokenURI(0);
            // if it's an IPFS URI, replace it with an HTTP Gateway Link
            tokenURI = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/");

            // Resolve the Token URI
            const metadata = await fetch(tokenURI);
            const metadataJSON = await metadata.json();

            // Extract image URI from the metadata
            let image = metadataJSON.imageURI;

            // if it's an IPFS URI, replace it with an HTTP Gateway Link
            image = image.replace("ipfs://", "https://ipfs.io/ipfs/");

            // Update state variables
            setName(metadataJSON.name);
            setImageURI(image);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
        
    // Fetch the NFT details when component is loaded
    useEffect(() => {
        fetchNFTDetails();
    }, []);

    

    return (
        <div>
            {loading ? (
               <span>Loading...</span>
            ) :(
                <div className={styles.card}>
                    <img src={imageURI} />
                    <div className={styles.container}>
                        <span>
                            <b>
                                {name} - #{props.tokenId}
                            </b>
                        </span>
                        <span>
                            Price: {formatEther(props.price)} CELO,{" "}
                            {formatUnits(props.priceInCusd, 2)} cUSD,{" "}
                            {formatUnits(props.priceInCeur, 2)} cEur
                        </span>
                        <span>
                            Seller: {" "}
                            {isOwner ? "You" : props.seller.substring(0, 6) + "..."}
                        </span>
                    </div>
                </div>
            )}
        </div>
    )
  }
        
}

