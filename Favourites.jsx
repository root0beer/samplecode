import React, { useState, useEffect } from "react";
import styles from "./Favourites.module.scss";
import Image from "next/image";
import { uiActions } from "@/store/ui-slice";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { cartActions } from "@/store/cart-slice";
import { favouritesActions } from "@/store/favourites-slice";
import { useMediaQuery } from "@react-hook/media-query";
import { removeFromFav } from "../../../lib/removeFromFav";

const Favourites = ({ favourites }) => {
  const [favs, setFavs] = useState([]);
  const isMobile = useMediaQuery("(max-width: 991.98px)");
  const [isSticky, setIsSticky] = useState(false);
  const dispatch = useDispatch();
  //we need to get a true/false value, for this we use useSelector
  const openFav = useSelector((state) => state.ui.favOpened);

  const userId = useSelector((state) => state.user.userId);

  const onCloseFavouritesHandler = () => {
    dispatch(uiActions.toggle("favOpened"));
  };

  // const favItems = useSelector((state) => state.favourites.favItems);
  const likedItems = useSelector((state) => state.ui.likedItems);

  useEffect(() => {
    if (!isMobile) {
      const handleScroll = () => {
        const heroHeight = document.querySelector(
          ".Hero_wrapperHero__eLUuM"
        ).offsetHeight;
        if (window.scrollY > heroHeight) {
          setIsSticky(true);
        } else {
          setIsSticky(false);
        }
      };

      window.addEventListener("scroll", handleScroll);

      return () => {
        window.removeEventListener("scroll", handleScroll);
      };
    }
  }, []);

  useEffect(() => {
    const fetchFavs = async () => {
      try {
        const res = await fetch("/api/favfinal");
        if (res.status !== 200) {
          throw new Error(
            `Failed to fetch fav items from mongo: ${res.status}`
          );
        }

        if (!res.ok) {
          throw new Error("Failed to fetch favourites");
        }
        const data = await res.json();

        const favproducts = await data.favourites;
        setFavs(favproducts);
      } catch (err) {
        console.log("error loading favourites", err);
      }
    };
    fetchFavs();
  }, [likedItems]);
  console.log(favs[0]?.products[0]?.product, "favourites in Favourites.jsx");

  let userFavs = [];
  userFavs = favs.filter((item) => {
    return item.userId === userId;
  });

  console.log(userFavs[0]?.products[0]?.product?.productId, "userFavs");
  const updatedFavItems = userFavs[0]?.products?.map((favourite) => {
    const likedFavourite = likedItems.find(
      (liked) => liked.likedId === favourite.product.productId
    );

    if (likedFavourite) {
      //i've put favourite.product here so I dont have to map through favourites saying favourite.product every time
      return { ...favourite.product, isLiked: likedFavourite.isLiked };
    } else {
      return { ...favourite.product, isLiked: false };
    }
  });
  const sortedFavItemsToDisplay = updatedFavItems?.filter((item) => item.isLiked === "true");
  console.log(updatedFavItems, "final fav items");
  console.log(sortedFavItemsToDisplay, "filtered final fav items");
  dispatch(favouritesActions.setFavItems(updatedFavItems));

  return (
    <>
      {openFav && (
        <div
          className={`${styles.overlay} ${
            openFav ? styles.overlayVisible : ""
          }`}
          onClick={onCloseFavouritesHandler}
        >
          <div
            className={`${isSticky ? styles.favWrapperFixed : styles.favWrapper}`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.favPaddings}>
              <div className={styles.navBarFav}>
                <div className={styles.favTitleBlock}>
                  <h2 className={styles.favTitle}>Favourites</h2>
                  <Image
                    className={styles.favouritesIcon}
                    src={"/products/likedheart.png"}
                    alt="heart"
                    width={40}
                    height={42}
                  />
                </div>
                <p
                  className={styles.favClose}
                  onClick={onCloseFavouritesHandler}
                >
                  Close
                </p>
              </div>
              <div className={styles.favouritesItemList}>
                {updatedFavItems?.map((favourite) => {
                  const addToCartHandler = () => {
                    dispatch(
                      cartActions.addItemToCart({
                        id: favourite.productId,
                        price: favourite.price,
                        title: favourite.title,
                        productImage: favourite.productImage,
                        productImageId: favourite.productImageId,
                        imageBlur: favourite.productImageBlur,
                      })
                    );
                  };
                  const removeFromFavourites = () => {
                    const id = favourite.productId;
                    dispatch(
                      favouritesActions.removeFavsFromFavouritesCart(id)
                    );
                    removeFromFav(userId, id);
                    dispatch(
                      uiActions.heartLikeStatusToggle({
                        id: id,
                        isLiked: favourite.isLiked,
                      })
                    );
                  };
                  return (
                    <div className={styles.favItemBlock}>
                      <div className={styles.favItemImageBlock}>
                        <Image
                          className={styles.favItemImage}
                          src={favourite.productImage}
                          alt={favourite.productImageId}
                          width={274}
                          height={183}
                          placeholder="blur"
                          blurDataURL={favourite.productImageBlur}
                        />
                      </div>
                      <h3 className={styles.favTitleItem}>{favourite.title}</h3>
                      <div className={styles.buttonsFavBlock}>
                        <button
                          className={styles.addtoCartBtn}
                          onClick={addToCartHandler}
                        >
                          Add to cart
                        </button>
                        <button
                          className={styles.removeFavBtn}
                          onClick={removeFromFavourites}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Favourites;
