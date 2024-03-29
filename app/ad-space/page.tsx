"use client";

import MainLayout from "@/components/layout/main";
import { Input } from "@/components/ui/input";
import { UploadButton, UploadFileResponse } from "@xixixao/uploadstuff/react";
// import "@xixixao/uploadstuff/react/styles.css";
import { cn, se } from "@/lib/utils";
import { useEffect, useState } from "react";
import {
  useMutationWithAuth,
  useQueryWithAuth,
} from "@convex-dev/convex-lucia-auth/react";
import { api } from "@/convex/_generated/api";
import { DatePickerWithPresets } from "@/components/ui/date-picker";
import { useQuery } from "convex/react";
import { getTime } from "date-fns";

export default function AdSpace() {
  const [link, setLink] = useState("");
  const [expiresAt, setExpiresAtDate] = useState<Date>();

  const generateUploadUrl = useMutationWithAuth(api.files.generateUploadUrl);
  const saveStorageId = useMutationWithAuth(api.files.saveStorageId);

  const saveAfterUpload = async (uploaded: UploadFileResponse[]) => {
    if (!link.length) {
      return alert("Link is not set");
    }

    if (!expiresAt) {
      return alert("Expires at date must be set");
    }
    await saveStorageId({
      storageId: (uploaded[0].response as any)?.storageId,
      link,
      expiresAt: getTime(expiresAt),
    });
  };

  const bannerData = useQuery(api.files.getBannerData);

  useEffect(() => {
    if (bannerData) {
      setLink(bannerData?.link);
      setExpiresAtDate(new Date(Number(bannerData?.expiresAt)));
    }
  }, [bannerData]);

  return (
    <MainLayout>
      <div className="mt-5 flex w-full flex-col gap-8">
        <div className="flex w-full items-center justify-between p-2">
          <div className="grid items-start gap-2">
            <Title>Ad space</Title>
            <SubTitle>
              Ad space that displays on the mobile app. Recomended size 16:9
            </SubTitle>
          </div>
          {/* <Button>Update</Button> */}
        </div>
        <div className="flex w-full grid-cols-[240px_minmax(0,1fr)] items-center justify-start gap-4 sm:grid">
          <div className="grid items-center justify-center gap-4">
            <Input
              name="link"
              type="text"
              placeholder="Enter banner link"
              value={link}
              onChange={(e) => setLink(e.currentTarget.value)}
            />
            <DatePickerWithPresets
              date={expiresAt}
              setDate={setExpiresAtDate}
            />
            <UploadButton
              uploadUrl={generateUploadUrl}
              fileTypes={["image/*"]}
              onUploadComplete={saveAfterUpload}
              onUploadError={(error: unknown) => {
                // Do something with the error.
                alert(`ERROR! ${error as string}`);
              }}
              content={(progress) =>
                progress ? `Uploading... ${progress}%` : "Upload"
              }
              className={(progress) =>
                cn(
                  "flex items-center justify-center rounded-lg bg-gray-200 px-4 py-2 text-black hover:cursor-pointer",
                  {
                    "bg-background border border-gray-500 text-white": progress,
                  },
                )
              }
            />
          </div>
          <div className="flex rounded-2xl border border-gray-600/40 p-2">
            {bannerData && (
              <img
                src={bannerData?.url ?? ""}
                height="300px"
                width="auto"
                className="overflow-hidden rounded-lg"
              />
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

const Title = se("p", "text-3xl font-medium text-white");
const SubTitle = se("span", "text-sm font-normal text-white");
